import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { AnalysisResponse } from "@/types/analysis";
import { auth } from "@/auth";

// Initialize the Google Gen AI client using your environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🌟 Keep the POST handler standard to prevent the Next.js compilation race condition
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request Dynamically at Runtime
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please connect your developer workspace." },
        { status: 401 }
      );
    }

    // Force TypeScript to treat this as a strict string now that we've verified its existence
    const userId = session.user.id as string;

    // 2. Extract incoming request body payload parameters
    const { resumeText, jobDescription, fileName } = await request.json();

    // 🛡️ Edge Case Guardrail 1: Check for missing, empty, or unviably brief resume text layout
    if (!resumeText || (resumeText as string).trim().length < 100) {
      return NextResponse.json(
        { error: "The extracted resume profile content is too short to compile a viable tactical gap assessment matrix." },
        { status: 400 }
      );
    }

    // Explicitly cast to clean string variables now that the runtime validation above has passed
    const safeResumeText = resumeText as string;
    const safeFileName = (fileName as string) || "Untitled_Resume.pdf";

    // 🛡️ Edge Case Guardrail 2: Sanitize target job descriptions to fall back gracefully if junk/empty inputs are provided
    const sanitizedJobDescription = jobDescription && (jobDescription as string).trim().length > 10
      ? (jobDescription as string).trim()
      : null;

    // Define the rigid JSON schema structure for the model output
    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        matchScore: { 
          type: Type.INTEGER, 
          description: "An overall score out of 100 assessing the profile strength against standard technical benchmarks or the job description." 
        },
        summary: { 
          type: Type.STRING, 
          description: "A concise paragraphs-long executive summary highlighting the candidate's core profile standing." 
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3-4 outstanding technical strengths or impactful metrics detected in the resume."
        },
        keywordGaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              keyword: { type: Type.STRING, description: "The industry specific tech stack, tool, or methodology missing." },
              importance: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "The critical tier of this requirement." }
            },
            required: ["keyword", "importance"]
          },
          description: "List of specific terms, tools, or architectural concepts missing that would optimize ATS parsing."
        },
        actionItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Clear, highly technical step-by-step optimization recommendations to refine the resume content."
        }
      },
      required: ["matchScore", "summary", "strengths", "keywordGaps", "actionItems"]
    };

    // Formulate the contextual system engineering instructions
    const systemInstruction = `
      You are an elite corporate technical recruiter and expert automated applicant tracking system (ATS) optimization matrix.
      Analyze the provided raw text extraction of a user's resume. If a targeted job description is provided, run a granular comparative gap analysis.
      If no targeted job description is provided, grade the resume text against modern industry standards for full-stack engineering, clean documentation practices, and quantitative performance metrics.
      You must respond strictly with a valid JSON structure following the exact schema provided. Do not include markdown code wrappers or extra conversational prose.
    `;

    // Construct the context-aware prompt block using our sanitized variable configuration
    const targetedJobPrompt = sanitizedJobDescription ? `Target Job Description Context:\n${sanitizedJobDescription}\n\n` : "";
    const userPrompt = `${targetedJobPrompt}Candidate Extracted Resume Text:\n${safeResumeText.trim()}`;

    // Execute the Gen AI request targeting gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.2, 
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty data matrix returned from the model stream.");
    }

    // Safely parse the valid string back into an accessible JSON node block
    const analysisData: AnalysisResponse = JSON.parse(responseText);

    // 3. Save the payload directly into the database tied to this user's account
    const savedResumeRecord = await prisma.resume.create({
      data: {
        userId: userId, 
        fileName: safeFileName,
        extractedText: safeResumeText, 
        matchScore: analysisData.matchScore,
        rawAnalysisJson: responseText, 
      },
    });

    // 4. Return both the parsing status and database metadata to the frontend UI
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