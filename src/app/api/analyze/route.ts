import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { AnalysisResponse } from "@/types/analysis";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // 2. Ensure User exists (Handles OAuth-to-DB sync safely)
    // We use a fallback for email to prevent database unique constraint violations
    const dbUser = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {}, 
      create: {
        id: session.user.id,
        email: session.user.email || `placeholder-${session.user.id}@auth.user`,
        name: session.user.name,
      },
    });

    // 3. Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 4. Parse and Validate Body
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

    const { resumeText, jobDescription, fileName } = body;
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({ error: "Resume text is too short." }, { status: 400 });
    }

    // 5. Generate Content
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

    // Extract text safely
    const rawText = response.text;
    if (!rawText) throw new Error("Model returned empty response.");
    
    const analysisData: AnalysisResponse = JSON.parse(rawText);

    // 6. Save to Database
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
    return NextResponse.json({ error: error.message || "An unexpected database or AI error occurred." }, { status: 500 });
  }
}