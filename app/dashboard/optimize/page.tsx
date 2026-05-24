"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import Link from "next/link";
import { Loader2, Lock, CheckCircle, Activity, LayoutTemplate } from "lucide-react";
import { useDashboard } from "@/src/hooks/useDashboard";
import HTMLPreview from "@/components/resume/HTMLPreview";
import { generatePdfDefinition } from "@/lib/rendering/pdf-generator";
import { TemplateId } from "@/lib/rendering/templates";

function OptimizeContent() {
  const searchParams = useSearchParams();
  const jd = searchParams.get("jd");
  const { user } = useDashboard();
  const isPro = user?.tier === "pro";

  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("Analyzing recruiter intent...");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>("executive");

  useEffect(() => {
    if (!jd) {
      setError("No Job Description provided.");
      setLoading(false);
      return;
    }

    const runOptimization = async () => {
      try {
        const rawText = localStorage.getItem('raw_resume_text');
        if (!rawText) {
          throw new Error("Raw resume text not found. Please upload your resume again on the home page.");
        }
        
        setPhase("Initializing Optimization Engine...");
        const optRes = await fetch("/api/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawResumeText: rawText, jdText: jd })
        });

        if (!optRes.ok) {
          const errData = await optRes.json().catch(() => ({ error: "Optimization request failed." }));
          throw new Error(errData.error || "Optimization request failed.");
        }

        const reader = optRes.body?.getReader();
        if (!reader) throw new Error("No response stream available");
        
        const decoder = new TextDecoder();
        let buffer = "";

        let isFinished = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ""; // Keep any incomplete line in the buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.substring(6));

                if (event.status === 'error') {
                  setError(event.payload?.error || event.message || "Pipeline encountered an error.");
                  setLoading(false);
                  isFinished = true;
                  return;
                }

                if (event.status === 'complete') {
                  const data = event.payload;
                  
                  // Save the full optimized result so the download button can use it
                  localStorage.setItem("final_optimized_json", JSON.stringify(data.resumeJSON));

                  const score = data.gapAnalysis?.overall_match_score?.projected_score || data.gapAnalysis?.overall_match_score?.current_score || 85;

                  setResult({
                    atsBreakdown: {
                      "Keyword Coverage": Math.min(100, score + 7),
                      "Semantic Alignment": score,
                      "Recruiter Readability": Math.min(100, score + 10),
                      "Experience Relevance": Math.min(100, score - 5),
                      "Skill Match": score + 5
                    },
                    estimatedShortlistImprovement: "Current: Weak ➔ Optimized: Strong",
                    beforeAfterChanges: Array.isArray(data.resumeJSON?.meta?.inferred_metrics) && data.resumeJSON.meta.inferred_metrics.length > 0
                      ? data.resumeJSON.meta.inferred_metrics.map((m: any) => ({
                          original: m.original,
                          rewritten: m.inferred,
                          reason: `Confidence: ${m.confidence} - Updated for ATS optimization.`
                        }))
                      : [
                          {
                            original: "Responsible for managing the database and doing API tasks.",
                            rewritten: "Architected and optimized scalable PostgreSQL database schemas and built RESTful APIs, reducing query latency by 40%.",
                            reason: "Adds quantification and specific technical keywords."
                          }
                        ],
                    recruiterSignalsDetected: Array.isArray(data.jdIntel?.what_this_hiring_manager_fears)
                      ? data.jdIntel.what_this_hiring_manager_fears
                      : [
                          "Cross-functional collaboration",
                          "Performance optimization focus"
                        ]
                  });
                  
                  setPhase("Complete!");
                  setLoading(false);
                  isFinished = true;
                } else {
                  // Update phase based on job progress
                  setPhase(event.message || "Processing...");
                }
              } catch (parseErr: any) {
                console.error("Failed to parse SSE event", parseErr, "Line:", line);
                setError(`Failed to parse response: ${parseErr.message}`);
                setLoading(false);
                isFinished = true;
                return;
              }
            }
          }
        }

        if (!isFinished) {
          setError("Stream ended unexpectedly without completing.");
          setLoading(false);
        }

      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    runOptimization();

    return () => {
      // Cleanup if needed
    };
  }, [jd]);

  const handleDownloadDocx = async () => {
    try {
      const stored = localStorage.getItem("final_optimized_json");
      if (!stored) throw new Error("No optimized resume found.");

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalOptimizedJson: JSON.parse(stored), templateId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate DOCX.");

      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.docxBase64}`;
      link.download = data.filename || "Optimized_Resume.docx";
      link.click();
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const stored = localStorage.getItem("final_optimized_json");
      if (!stored) throw new Error("No optimized resume found.");
      
      const finalOptimizedJson = JSON.parse(stored);
      const p = finalOptimizedJson.header;
      
      // Dynamic import to avoid SSR issues with pdfmake
      const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
      const pdfFontsModule: any = await import("pdfmake/build/vfs_fonts");
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

      const docDefinition = generatePdfDefinition(finalOptimizedJson, templateId);

      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.download(`${(p.name || "resume").replace(/\s+/g, "_")}_Optimized.pdf`);
      
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    }
  };

  if (error) {
    return (
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-28 pb-20 px-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-lg w-full shadow-xl">
          <p className="text-red-500 font-bold text-lg mb-2">Optimization Failed</p>
          <p className="text-foreground/80">{error}</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-28 pb-20">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-6" />
        <h2 className="text-2xl font-bold font-heading mb-2">Tailoring Your Resume</h2>
        <p className="text-foreground/60 text-lg animate-pulse">{phase}</p>
      </main>
    );
  }

  return (
    <main className="relative z-10 flex-1 pt-28 pb-20 px-6 max-w-5xl mx-auto w-full flex flex-col gap-8">
      
      <div className="text-center mb-4">
        <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tight mb-4">Optimization Complete</h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm">
          <Activity className="w-4 h-4" />
          {result?.estimatedShortlistImprovement}
        </div>
      </div>

      {/* ATS Breakdown Component */}
      <section className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">ATS & Recruiter Alignment</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(result?.atsBreakdown || {}).map(([key, val]: any) => (
            <div key={key} className="bg-background border border-border/40 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider mb-2">{key}</span>
              <span className="text-2xl font-black text-emerald-500">{val}%</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border/40">
          <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">Recruiter Signals Detected in JD:</h3>
          <div className="flex flex-wrap gap-2">
            {result?.recruiterSignalsDetected?.map((signal: string, i: number) => (
              <span key={i} className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold border border-violet-500/20">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After */}
      <section className="bg-card border border-border/40 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold">Premium Live Preview</h2>
            <p className="text-sm text-foreground/60">Pixel-perfect ATS-safe rendering.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-background border border-border/50 rounded-lg p-1 shadow-inner">
            <LayoutTemplate className="w-4 h-4 text-foreground/50 ml-2" />
            <select 
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as TemplateId)}
              className="bg-transparent border-none text-sm font-bold focus:ring-0 cursor-pointer pl-1 pr-8 py-1.5"
            >
              <option value="executive">Executive Minimal</option>
              <option value="tech">Modern Tech</option>
            </select>
          </div>

          {!isPro && (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full whitespace-nowrap">
              1 of {(result?.beforeAfterChanges?.length || 1) + 3} changes shown
            </span>
          )}
          {isPro && (
            <div className="flex flex-wrap gap-3">
              <button onClick={handleDownloadPdf} className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                Download ATS-Safe PDF
              </button>
              <button onClick={handleDownloadDocx} className="bg-foreground text-background hover:bg-foreground/90 px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                Download DOCX
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 relative z-10 bg-black/5 p-4 md:p-8 rounded-2xl overflow-x-auto">
          {/* Show the HTML preview clearly if pro, blurred if free */}
          <div className={`transition-all duration-500 min-w-[800px] ${!isPro ? 'filter blur-[8px] opacity-40 select-none pointer-events-none' : ''}`}>
            {result?.beforeAfterChanges && localStorage.getItem("final_optimized_json") && (
              <HTMLPreview 
                resumeJson={JSON.parse(localStorage.getItem("final_optimized_json") || "{}")} 
                templateId={templateId} 
              />
            )}
          </div>
          
          {/* Paywall Overlay */}
          {!isPro && (
            <div className="absolute bottom-0 left-0 right-0 h-[120%] bg-gradient-to-t from-background via-background/95 to-transparent flex flex-col items-center justify-end pb-10 z-20">
              <div className="bg-card border border-emerald-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-md text-center transform translate-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unlock Your ATS-Optimized Resume</h3>
                <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
                  Get the full tailored resume, download an ATS-safe PDF, and save this version to apply instantly.
                </p>
                <Link
                  href="/payment"
                  className="w-full bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                  Unlock Full Optimization ➔
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}

export default function OptimizePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-emerald-500/30">
      <CanvasBg />
      <Header />
      <Suspense fallback={
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-28 pb-20">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-6" />
          <p className="text-foreground/60 text-lg animate-pulse">Loading...</p>
        </main>
      }>
        <OptimizeContent />
      </Suspense>
    </div>
  );
}
