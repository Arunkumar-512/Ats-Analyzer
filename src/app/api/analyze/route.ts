import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { AnalysisResponse } from "@/types/analysis";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await auth();
    console.log("MOBILE_DEBUG_SESSION_ID:", session?.user?.id);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

  // 2. Defensive User Sync (Hardened for Mobile Sessions)
    let dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // If user exists, we proceed immediately. 
    // If not, we only then attempt the creation.
    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email ?? `placeholder-${session.user.id}@auth.user`,
            name: session.user.name ?? "Anonymous",
          },
        });
      } catch (err) {
        // If create fails (Unique Constraint), just re-fetch the user record
        // This handles cases where the record was created by another process 
        // in the milliseconds between the findUnique and the create.
        dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        
        if (!dbUser) throw new Error("Database sync failed.");
      }
    }

    // 3. Initialize Gemini
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing.");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 4. Parse Body
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

    const { resumeText, jobDescription, fileName } = body;
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({ error: "Resume text too short." }, { status: 400 });
    }

    // 5. Generate Content (Schema remains the same)
    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        matchScore: { type: Type.INTEGER },
        summary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywordGaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING },
              importance: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
            },
            required: ["keyword", "importance"]
          }
        },
        actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["matchScore", "summary", "strengths", "keywordGaps", "actionItems"]
    };

    const userPrompt = `${jobDescription ? `Job: ${jobDescription}\n\n` : ""}Resume: ${resumeText.trim()}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: "You are an elite corporate technical recruiter. Respond strictly with valid JSON.",
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.2,
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("Empty response from AI.");
    const analysisData: AnalysisResponse = JSON.parse(rawText);

    // 6. Save Resume
    const savedResumeRecord = await prisma.resume.create({
      data: {
        userId: dbUser.id,
        fileName: (fileName as string) || "Untitled_Resume.pdf",
        extractedText: resumeText as string,
        matchScore: analysisData.matchScore,
        rawAnalysisJson: rawText,
      },
    });

    return NextResponse.json({ success: true, resumeId: savedResumeRecord.id, ...analysisData });

  } catch (error: any) {
    console.error("ANALYSIS_ROUTE_ERROR:", error);
    return NextResponse.json({ error: error.message || "An error occurred." }, { status: 500 });
  }
}