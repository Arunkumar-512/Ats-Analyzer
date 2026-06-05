import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedData = await pdf(buffer, {});
    
    const cleanText = parsedData.text
      .replace(/\n\s*\n/g, "\n")
      .trim();

    return NextResponse.json({ 
      text: cleanText,
      pages: parsedData.numpages 
    }, { status: 200 });

  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from the PDF template." },
      { status: 500 }
    );
  }
}