import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from "@/types/analysis";

// Initialize the Google Gen AI client using your environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobDescription } = await request.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Missing resume text layout." }, { status: 400 });
    }

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

    // Construct the context-aware prompt block
    const targetedJobPrompt = jobDescription ? `Target Job Description Context:\n${jobDescription}\n\n` : "";
    const userPrompt = `${targetedJobPrompt}Candidate Extracted Resume Text:\n${resumeText}`;

    // Execute the Gen AI request targeting gemini-2.5-pro or gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        // Enforce structural output compliance
        responseMimeType: "application/json",
        responseSchema: jsonSchema,
        temperature: 0.2, // Kept low for consistent analytical outcomes
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty data matrix returned from the model stream.");
    }

    // Safely parse the valid string back into an accessible JSON node block
    const analysisData: AnalysisResponse = JSON.parse(responseText);

    return NextResponse.json(analysisData, { status: 200 });

  } catch (error: any) {
    console.error("Gemini Execution Error:", error);
    return NextResponse.json(
      { error: "AI processing sequence encountered a validation layout fault." },
      { status: 500 }
    );
  }
}