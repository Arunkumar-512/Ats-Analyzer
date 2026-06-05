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
      console.error("AUTH_FAILURE: Session is null or user ID missing.");
      return NextResponse.json(
        { error: "Unauthorized. Please ensure you are logged in." },
        { status: 401 }
      );
    }

    // 2. Initialize Gemini client
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // 3. Parse and Validate Body
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { resumeText, jobDescription, fileName } = body;

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: "Resume text is too short." },
        { status: 400 }
      );
    }

    const safeResumeText = resumeText as string;
    const safeFileName = (fileName as string) || "Untitled_Resume.pdf";
    const sanitizedJobDescription = jobDescription && (jobDescription as string).trim().length > 10
      ? (jobDescription as string).trim()
      : null;

    // Define JSON Schema
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

    const systemInstruction = `You are an elite corporate technical recruiter. Respond strictly with valid JSON following the schema.`;

    const userPrompt = `${sanitizedJobDescription ? `Job: ${sanitizedJobDescription}\n\n` : ""}Resume: ${safeResumeText.trim()}`;

    // 4. Generate Content with updated stable model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Updated from gemini-1.5-flash
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Model returned empty response.");

    const analysisData: AnalysisResponse = JSON.parse(responseText);

    // 5. Save to Database
    const savedResumeRecord = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: safeFileName,
        extractedText: safeResumeText,
        matchScore: analysisData.matchScore,
        rawAnalysisJson: responseText,
      },
    });

    return NextResponse.json({ success: true, resumeId: savedResumeRecord.id, ...analysisData });

  } catch (error: any) {
    console.error("ANALYSIS_ROUTE_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}