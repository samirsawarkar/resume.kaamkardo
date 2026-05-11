"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import Link from "next/link";

// ── Types ───────────────────────────────────────────────────
type ATSResult = {
  score: number;
  grade: string;
  data_quality: {
    truncated: boolean;
    truncation_note: string | null;
    extraction_confidence: string;
  };
  domain: string;
  level: string;
  fit_roles: string[];
  jd_match: {
    enabled: boolean;
    match_score: number | null;
    matched_keywords: string[];
    missing_keywords: string[];
  };
  salary: {
    current_projection: string;
    real_potential: string;
    gap_reason: string;
  };
  brutal_truth: string[];
  top_skills: string[];
  missing_skills: string[];
  quick_fixes: string[];
  section_scores: {
    keywords: number;
    achievements: number;
    formatting: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  score_audit: string;
  percentile: number;
  total_submissions?: number;
  rewrites?: { original: string; rewritten: string }[];
};

// ── Component ─────────────────────────────────────────────────
export default function AtsScorePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "Parsing PDF structure & layout...",
    "Extracting work experience & keywords...",
    "Evaluating impact metrics & numbers...",
    "Analyzing formatting against ATS parsers...",
    "Calculating final ATS score & grade...",
    "Generating the Brutal Truth report...",
    "Finalizing salary predictions..."
  ];

    useEffect(() => {
      let progressTimer: NodeJS.Timeout;
      let messageInterval: NodeJS.Timeout;
  
      if (loading) {
        setLoadingProgress(0);
        setLoadingMessageIdx(0);
  
        // Dynamic progress update
        const updateProgress = () => {
          setLoadingProgress((prev) => {
            if (prev >= 99.5) return 99.5; // Cap at 99.5% until complete
            
            // Decelerating increment:
            // 0-50%: Fast
            // 50-85%: Medium
            // 85-99%: Slow crawl
            const remaining = 100 - prev;
            const increment = Math.max(0.05, remaining / 30); 
            
            // Add a bit of randomness to make it feel "human"
            const jitter = (Math.random() - 0.5) * 0.1;
            return Math.min(99.5, prev + increment + jitter);
          });
          
          // Random delay for the next "tick" to make it feel less robotic
          const nextTick = Math.random() * 400 + 300; 
          progressTimer = setTimeout(updateProgress, nextTick);
        };
  
        updateProgress();
  
        messageInterval = setInterval(() => {
          setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
        }, 3500);
      }
  
      return () => {
        clearTimeout(progressTimer);
        clearInterval(messageInterval);
      };
    }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === "application/pdf" ||
        droppedFile.name.endsWith(".pdf") ||
        droppedFile.name.endsWith(".docx")
      ) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF or DOCX file.");
      }
    }
  };

  const analyzeResume = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    if (jdText.trim()) {
      formData.append("jd_text", jdText.trim());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      setLoadingProgress(100);
      setTimeout(() => {
        setResult(data.result);
        // Save to localStorage so the premium Dashboard can pick it up without re-uploading
        if (typeof window !== "undefined") {
          localStorage.setItem('parsed_resume_data', JSON.stringify(data.result));
        }
        setLoading(false);
      }, 600);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Helper to color the score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CanvasBg />
      <Header />

      <main className="relative z-10 flex-1 pt-32 pb-20 px-6 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black font-heading mb-3 tracking-tight">
              Get Your <span className="text-foreground/50">ATS Score</span>
            </h1>
            <p className="text-foreground/60 text-lg">
              Find out exactly why you are getting rejected.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── State 1: Upload / Loading ── */}
            {!result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-premium"
              >
                {!loading ? (
                  <div className="flex flex-col gap-6">
                    {/* Drag & Drop Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-foreground bg-foreground/5"
                          : "border-border hover:border-foreground/40 hover:bg-foreground/[0.02]"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                      />

                      <div className="w-14 h-14 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                        <UploadCloud className="w-6 h-6 text-foreground/70" />
                      </div>

                      {file ? (
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <File className="w-4 h-4 text-emerald-500" />
                          {file.name}
                        </div>
                      ) : (
                        <>
                          <p className="text-foreground font-semibold mb-1">
                            Click or drag your resume here
                          </p>
                          <p className="text-sm text-foreground/50">
                            PDF or DOCX (Max 5MB)
                          </p>
                        </>
                      )}
                    </div>

                    {/* JD Input */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
                        Job Description (Optional but recommended)
                      </label>
                      <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the Job Description here to get tailored rewrites and match scoring..."
                        className="w-full bg-foreground/5 border border-border/50 rounded-xl p-4 min-h-[120px] text-sm text-foreground/80 focus:outline-none focus:border-foreground/30 resize-none"
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      onClick={analyzeResume}
                      disabled={!file}
                      className="w-full py-4 rounded-xl bg-foreground text-background font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      Analyze My Resume
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 border-4 border-foreground/10 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground/80 font-mono">
                        {Math.round(loadingProgress)}%
                      </div>
                    </div>
                    
                    <div className="h-8 mb-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={loadingMessageIdx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-lg font-bold font-heading text-foreground"
                        >
                          {loadingMessages[loadingMessageIdx]}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                    
                    <div className="w-full max-w-sm h-2 bg-foreground/10 rounded-full overflow-hidden mt-2">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${loadingProgress}%` }}
                        transition={{ ease: "linear", duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── State 2: Results ── */}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Header */}
                <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-premium flex flex-col md:flex-row items-center gap-8 text-center md:text-left relative overflow-hidden">
                  {/* Top Percentile Badge */}
                  {(result.total_submissions ?? 0) >= 100 && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-background text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                      Top {result.percentile}%
                    </div>
                  )}

                  <div
                    className={`w-32 h-32 shrink-0 rounded-full border-4 flex flex-col items-center justify-center relative ${getScoreColor(
                      result.score
                    )}`}
                  >
                    <span className="text-5xl font-black font-heading tracking-tighter">
                      {result.score}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        Grade {result.grade}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                        {result.score >= 90 ? "Excellent" : result.score >= 70 ? "Average" : "Critical Risk"}
                      </div>
                    </div>
                    <h2 className="text-3xl font-black font-heading tracking-tight mb-2">
                      {result.domain}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-foreground/60 justify-center md:justify-start mb-4">
                      <div>
                        Level: <strong className="text-foreground">{result.level}</strong>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-2">Targeting Roles:</div>
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {result.fit_roles.map((role) => (
                          <span key={role} className="bg-foreground/5 border border-border/50 px-3 py-1 rounded-lg text-xs font-medium text-foreground/70">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Scores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "ATS Keyword Density", score: result.section_scores.keywords, max: 20 },
                    { label: "Impact & Quantification", score: result.section_scores.achievements, max: 20 },
                    { label: "Formatting & Readability", score: result.section_scores.formatting, max: 15 },
                    { label: "Experience Quality", score: result.section_scores.experience, max: 15 },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card/50 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
                      <div className="flex justify-between items-end mb-3">
                         <div className="text-xs font-bold uppercase tracking-widest text-foreground/60">{stat.label}</div>
                         <div className="text-xl font-black font-mono tracking-tighter">{stat.score}<span className="text-sm text-foreground/30 font-sans">/{stat.max}</span></div>
                      </div>
                      <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        <div 
                           className={`h-full rounded-full transition-all ${stat.score / stat.max > 0.8 ? 'bg-emerald-500' : stat.score / stat.max > 0.5 ? 'bg-amber-500' : 'bg-red-500'}`}
                           style={{ width: `${(stat.score / stat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* The Brutal Truth & Quick Fixes */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-3xl p-8 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-red-500 border-b border-red-500/20 pb-4">
                      <AlertCircle className="w-4 h-4" />
                      Critical Vulnerabilities
                    </h3>
                    <ul className="space-y-4 relative z-10">
                      {result.brutal_truth.map((truth, i) => (
                        <li key={i} className="flex gap-4 text-sm text-foreground/80 leading-relaxed">
                          <span className="text-red-500 font-black font-mono shrink-0 mt-0.5">0{i+1}</span>
                          {truth}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-8 shadow-premium relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 text-emerald-500 border-b border-emerald-500/20 pb-4">
                      <CheckCircle className="w-4 h-4" />
                      Remediation Protocol
                    </h3>
                    <ul className="space-y-4 relative z-10">
                      {result.quick_fixes.map((fix, i) => (
                        <li key={i} className="flex gap-4 text-sm text-foreground/80 leading-relaxed">
                          <span className="text-emerald-500 font-black font-mono shrink-0 mt-0.5">0{i+1}</span>
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* JD Match & AI Rewrites */}
                {result.jd_match?.enabled && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-premium">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-4">
                        JD Match ({result.jd_match.match_score}%)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-bold text-emerald-500 mb-2 uppercase">Matched Keywords</div>
                          <div className="flex flex-wrap gap-2">
                            {result.jd_match.matched_keywords.map((k) => (
                              <span key={k} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-1 rounded text-xs">{k}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-red-500 mb-2 uppercase">Missing Keywords</div>
                          <div className="flex flex-wrap gap-2">
                            {result.jd_match.missing_keywords.map((k) => (
                              <span key={k} className="bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-1 rounded text-xs">{k}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-premium">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-violet-500 mb-4">
                        AI Bullet Rewrites
                      </h3>
                      {result.rewrites && result.rewrites.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                          {result.rewrites.map((r, i) => (
                            <div key={i} className="bg-background rounded-xl p-4 border border-border/50 text-sm">
                              <div className="text-red-500/70 line-through mb-2">{r.original}</div>
                              <div className="text-emerald-500 font-medium">{r.rewritten}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-foreground/50">
                          {result.score >= 95 ? "Your bullets are already perfectly aligned with the JD!" : "Could not generate rewrites."}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Salary & Skills */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-premium relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-500/5 pointer-events-none"></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 mb-6 border-b border-border/50 pb-4">
                      Market Value Forecast
                    </h3>
                    <div className="space-y-6 mb-6">
                      <div className="flex justify-between items-end border-b border-border/50 pb-4">
                        <div className="text-xs font-bold uppercase tracking-widest text-foreground/50">Current Baseline</div>
                        <div className="text-2xl font-black font-mono tracking-tighter text-foreground/80">{result.salary.current_projection}</div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-500">Optimized Potential</div>
                        <div className="text-3xl font-black font-mono tracking-tighter text-emerald-500">{result.salary.real_potential}</div>
                      </div>
                    </div>
                    <div className="bg-background/50 p-4 rounded-2xl border border-border/50 text-xs text-foreground/70 leading-relaxed italic relative">
                      <span className="absolute top-2 left-2 text-4xl font-serif text-foreground/10 leading-none">"</span>
                      <span className="relative z-10 pl-6 block">{result.salary.gap_reason}</span>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-6 shadow-premium flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-3">
                        Top Skills Found
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.top_skills.map((skill) => (
                          <span key={skill} className="bg-foreground/5 border border-border/50 px-3 py-1.5 rounded-lg text-xs text-foreground/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-red-500/70 mb-3">
                        Missing Skills (Expected)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_skills.map((skill) => (
                          <span key={skill} className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upsell CTA */}
                <div className="mt-12 bg-gradient-to-r from-foreground to-foreground/80 rounded-3xl p-10 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CheckCircle className="w-48 h-48" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black font-heading mb-4 text-background tracking-tight">Deploy the 10/10 Architecture</h3>
                    <p className="text-background/80 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                      Unlock our proprietary Claude 3.5 rewriting engine. We will structurally reconstruct your resume into a mathematically perfect PDF and hand you the 30-Day Job Hunt Tracker.
                    </p>
                    <Link href="/payment" className="inline-block bg-background text-foreground px-10 py-4 rounded-full font-bold tracking-widest uppercase text-sm hover:scale-105 transition-transform shadow-xl">
                      Unlock Premium Analysis — ₹299
                    </Link>
                    <p className="text-background/50 text-xs mt-6 uppercase tracking-widest font-bold">Instant Delivery • Lifetime Access</p>
                  </div>
                </div>


                {/* Reset */}
                <div className="text-center mt-8">
                  <button
                    onClick={() => {
                      setResult(null);
                      setFile(null);
                    }}
                    className="text-sm text-foreground/40 hover:text-foreground transition-colors"
                  >
                    Analyze another resume
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
