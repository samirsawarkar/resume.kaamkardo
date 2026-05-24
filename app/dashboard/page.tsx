"use client";

import { useState } from "react";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import Link from "next/link";
import { Loader2, CheckCircle, MoveRight, ExternalLink, Activity, Target, Zap, UploadCloud, FileText, Lock, AlertTriangle, Briefcase } from "lucide-react";

import { useDashboard } from "@/src/hooks/useDashboard";

export default function DashboardPage() {
  const {
    hasUploadedResume,
    isUploading,
    loading,
    rateLimited,
    parsedRole,
    atsScore,
    strengths,
    weaknesses,
    fileName,
    handleFileUpload,
    user,
    fileUrl,
  } = useDashboard();

  const [jdText, setJdText] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 1. Loading State (Prevent Flash)
  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CanvasBg />
        <Header />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
          <p className="text-lg font-bold font-heading animate-pulse">Initializing OS...</p>
        </main>
      </div>
    );
  }

  // 2. Auth Check (Middleware handles redirect, but this prevents render)
  if (!user && !loading) {
    return null;
  }

  const handleOptimize = () => {
    if (!jdText.trim()) return;
    setIsOptimizing(true);
    // TODO: Route to paywall or optimization engine
    setTimeout(() => {
      window.location.href = `/dashboard/optimize?jd=${encodeURIComponent(jdText.substring(0, 100))}`;
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CanvasBg />
      <Header />
      <main className="relative z-10 flex-1 pt-28 pb-20 px-6 max-w-5xl mx-auto w-full flex flex-col gap-12">
        
        {!hasUploadedResume ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] w-full text-center px-4 mt-8">
            <div className="bg-card border border-border/40 rounded-2xl p-10 shadow-sm w-full relative overflow-hidden">
              
              {rateLimited ? (
                <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-full mx-auto flex items-center justify-center mb-6 border border-amber-500/20">
                    <AlertTriangle className="w-10 h-10 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Systems Under Heavy Load</h2>
                  <p className="text-foreground/60 text-base mb-8 leading-relaxed max-w-md mx-auto">
                    Our free ATS optimization engine is currently experiencing extremely high traffic and has reached its request limit. Please try again in a few minutes.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-foreground text-background hover:bg-foreground/90 font-bold py-3 px-8 rounded-xl transition-colors shadow-sm"
                  >
                    Refresh & Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-foreground/5 rounded-full mx-auto flex items-center justify-center mb-6 border border-border/50">
                    <UploadCloud className="w-10 h-10 text-foreground/50" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Upload Master Resume</h2>
                  <p className="text-foreground/60 text-base mb-8 leading-relaxed max-w-md mx-auto">
                    Start by securely uploading your current resume. Our AI will analyze its baseline ATS readability.
                  </p>
                  <div className="relative border-2 border-dashed border-border/60 rounded-xl p-8 hover:bg-foreground/5 transition-colors cursor-pointer mb-2 flex flex-col items-center justify-center gap-3 group overflow-hidden bg-background/50">
                    <input 
                      type="file" 
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <FileText className={`w-8 h-8 transition-colors ${isUploading ? 'text-emerald-500 animate-bounce' : 'text-foreground/40 group-hover:text-emerald-500'}`} />
                    <span className="text-sm font-medium text-foreground/60">
                      {isUploading ? `Parsing ${fileName}...` : "Drag & drop your PDF/DOCX here"}
                    </span>
                    
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 w-full bg-emerald-500/20 h-1">
                        <div className="bg-emerald-500 h-full animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1 capitalize">JD Optimizer</h1>
                <p className="text-foreground/60 text-base">Paste a Job Description to generate a tailored resume.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-card border border-border/40 shadow-sm">
                {user?.tier === 'pro' ? (
                  <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500 font-medium">Pro Active</span></>
                ) : (
                  <><Target className="w-4 h-4 text-foreground/40" /> <span className="text-foreground/40 font-medium">Free Plan</span></>
                )}
              </div>
            </div>

            {/* Step Tracker */}
            <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl p-6 overflow-x-auto shadow-sm mb-8">
              {[
                { step: 1, label: "Upload Resume", done: true },
                { step: 2, label: "ATS Check", done: true },
                { step: 3, label: "Paste JD", done: jdText.length > 50 },
                { step: 4, label: "Optimize & Download", done: false }
              ].map((s, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-3 ${s.done ? "text-emerald-500" : "text-foreground/40"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-foreground/10"}`}>
                      {s.done ? <CheckCircle className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className="text-sm font-semibold tracking-wide hidden sm:block">{s.label}</span>
                  </div>
                  {i < 3 && <div className={`w-6 sm:w-12 md:w-24 h-px mx-3 sm:mx-6 ${s.done ? "bg-emerald-500/40" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column: Free ATS Score & File */}
              <div className="flex flex-col gap-6">
                <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-500"/> Baseline Analysis
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-background rounded-xl p-4 border border-border/40">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Detected Role</div>
                      <div className="text-base font-bold text-foreground capitalize truncate" title={parsedRole}>{parsedRole}</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border/40">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Raw ATS Score</div>
                      <div className={`text-xl font-bold ${atsScore >= 80 ? 'text-emerald-500' : atsScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{atsScore}/100</div>
                    </div>
                  </div>

                  <div className="bg-background rounded-xl p-4 border border-border/40 mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-2">Critical Weaknesses</div>
                    <ul className="text-sm text-foreground/80 space-y-1 list-disc pl-4">
                      {weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                      {weaknesses.length === 0 && <li>No major formatting issues detected.</li>}
                    </ul>
                  </div>
                </section>

                {fileUrl && (
                  <div className="border border-border/40 rounded-xl overflow-hidden bg-background shadow-sm">
                    <div className="bg-card p-3 border-b border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <FileText className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Uploaded Resume</h3>
                      </div>
                    </div>
                    <iframe 
                      src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-[300px] bg-white" 
                      title="Resume Preview"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: JD Input */}
              <div className="flex flex-col h-full">
                <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold">Paste Job Description</h2>
                  </div>
                  
                  <p className="text-sm text-foreground/60 mb-4">
                    Paste the full text of the job description you are applying for. Our AI will analyze the recruiter intent and rewrite your resume to match.
                  </p>

                  <textarea
                    className="w-full flex-1 min-h-[300px] p-4 rounded-xl bg-background border border-border/40 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all text-sm font-mono"
                    placeholder="e.g. We are looking for a Senior Software Engineer with 5+ years of experience in React and Node.js..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                  />

                  <div className="mt-6">
                    <button
                      onClick={handleOptimize}
                      disabled={isOptimizing || jdText.length < 50}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOptimizing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Intent...</>
                      ) : (
                        <><Zap className="w-5 h-5" /> Tailor Resume for This Job</>
                      )}
                    </button>
                    {jdText.length > 0 && jdText.length < 50 && (
                      <p className="text-xs text-amber-500 text-center mt-2 font-medium">Please paste a longer job description.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
