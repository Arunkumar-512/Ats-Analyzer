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
      return NextResponse.json(
        { error: "Unauthorized. Please connect your developer workspace." },
        { status: 401 }
      );
    }

    // 2. Initialize client INSIDE the function 
    // This ensures Vercel's environment variables are correctly loaded at runtime
    if (!process.env.GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables!");
      throw new Error("Server configuration error.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const userId = session.user.id as string;
    const { resumeText, jobDescription, fileName } = await request.json();

    // 🛡️ Validation
    if (!resumeText || (resumeText as string).trim().length < 100) {
      return NextResponse.json(
        { error: "The extracted resume profile content is too short to compile a viable tactical gap assessment matrix." },
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
        matchScore: { type: Type.INTEGER, description: "Score out of 100" },
        summary: { type: Type.STRING, description: "Executive summary" },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strengths" },
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
        actionItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optimization tips" }
      },
      required: ["matchScore", "summary", "strengths", "keywordGaps", "actionItems"]
    };

    const systemInstruction = `You are an elite corporate technical recruiter and expert ATS optimization matrix. Respond strictly with a valid JSON structure following the exact schema provided. Do not include markdown code wrappers or extra conversational prose.`;

    const targetedJobPrompt = sanitizedJobDescription ? `Target Job Description Context:\n${sanitizedJobDescription}\n\n` : "";
    const userPrompt = `${targetedJobPrompt}Candidate Extracted Resume Text:\n${safeResumeText.trim()}`;

    // Execute Gen AI Request
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Verified model name
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty data matrix returned.");

    const analysisData: AnalysisResponse = JSON.parse(responseText);

    // 3. Save to Database
    const savedResumeRecord = await prisma.resume.create({
      data: {
        userId: userId,
        fileName: safeFileName,
        extractedText: safeResumeText,
        matchScore: analysisData.matchScore,
        rawAnalysisJson: responseText,
      },
    });

    return NextResponse.json({
      success: true,
      resumeId: savedResumeRecord.id,
      ...analysisData
    }, { status: 200 });

  } catch (error: any) {
    console.error("Gemini Execution Error:", error);
    return NextResponse.json(
      { error: "AI processing sequence encountered a validation layout fault." },
      { status: 500 }
    );
  }
}