"use client";

import React, { useState, useRef } from "react";

// 🌟 Clean, explicit types for our component communication boundary
interface DropZoneProps {
  onFileSelect: (file: File) => void;
  status: "idle" | "parsing" | "analyzing" | "success";
  error: string | null;
}

// 🌟 Pass the structured interface props directly into the React function execution signature
export default function DropZone({ onFileSelect, status, error }: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileValidation = (selectedFile: File) => {
    setLocalError(null);
    
    // Immediate early-exit validation guards
    if (selectedFile.type !== "application/pdf") {
      setLocalError("Please upload a valid PDF file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setLocalError("File size exceeds the 5MB maximum threshold.");
      return;
    }

    setFile(selectedFile);
    // 🚀 Hand off the valid file asset straight up to our parent controller pipeline!
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (status === "parsing" || status === "analyzing") return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileValidation(e.target.files[0]);
    }
  };

  // Prioritize parent server errors over basic local client side errors
  const activeError = error || localError;

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => status === "idle" && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
          status === "parsing" || status === "analyzing" 
            ? "border-slate-500 bg-white/5 animate-pulse cursor-wait" :
          status === "success" 
            ? "border-emerald-500 bg-emerald-500/5 cursor-default" :
            "border-slate-700 bg-white/80 hover:bg-white/80 hover:border-slate-500 cursor-pointer"
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf" 
          className="hidden" 
          disabled={status !== "idle"} 
        />

        <div className="text-4xl mb-4">
          {status === "parsing" && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>}
          {status === "analyzing" && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>}
          {status === "success" && <div className="text-emerald-400">✅</div>}
          {status === "idle" && <div className="text-slate-900">📄</div>}
        </div>
        
        <div className="text-center">
          {status === "parsing" && <p className="text-amber-400 font-medium">Extracting raw text strings...</p>}
          {status === "analyzing" && <p className="text-cyan-400 font-medium">Gemini model executing deep analysis...</p>}
          {status === "success" && (
            <div>
              <p className="text-emerald-400 font-medium">Analysis Complete!</p>
              <p className="text-slate-300 text-sm mt-1">{file?.name}</p>
            </div>
          )}
          {status === "idle" && (
            <>
              <p className="text-lg font-semibold text-slate-900">
                Drag & drop your resume, or <span className="text-emerald-600">browse</span>
              </p>
              <p className="text-sm text-slate-500 mt-2">PDF files up to 5MB</p>
            </>
          )}
        </div>
      </div>

      {activeError && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm text-center font-medium">
          ⚠️ {activeError}
        </div>
      )}
    </div>
  );
}