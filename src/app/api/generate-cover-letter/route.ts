// app/api/generate-cover-letter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { auth } from "@/auth";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const POST = auth(async function POST(request) {
  try {
    // 1. Authenticate Request
    if (!request.auth || !request.auth.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { resumeText, jobDescription } = await request.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Both a parsed resume and a target job description are required to generate tailored assets." },
        { status: 400 }
      );
    }

    // 2. Engineer the Custom Professional Prompt
    const systemInstruction = `
      You are an expert executive career coach and elite copywriter. 
      Your task is to write a highly tailored, persuasive, and professional cover letter based on a candidate's resume text and a target job description.
      Align the candidate's core strengths to the high-priority requirements of the job. Address any subtle language deficits gracefully by emphasizing adaptability and transferrable expertise.
      Keep the tone confident, sophisticated, and technically precise (no generic filler phrases or clichés like 'Thinking outside the box'). Maximize professional impact.
    `;

    const userPrompt = `
      Target Job Description Context:
      ${jobDescription}

      Candidate Resume Text:
      ${resumeText}

      Generate a beautiful, polished cover letter text block with standard formal business layout spacing (Date, Hiring Manager, Salutation, Body Paragraphs, Sign-off). Do not include any extra conversational intro or outro text, just the cover letter itself.
    `;

    // 3. Request Prose Generation from Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, // Slightly higher for fluid, natural professional storytelling prose
      }
    });

    const coverLetterText = response.text;
    if (!coverLetterText) {
      throw new Error("Gemini stream failed to output letter content.");
    }

    return NextResponse.json({ coverLetter: coverLetterText }, { status: 200 });

  } catch (error: any) {
    console.error("Cover Letter Generator Error:", error);
    return NextResponse.json({ error: "Failed to generate tailored cover letter asset." }, { status: 500 });
  }
});