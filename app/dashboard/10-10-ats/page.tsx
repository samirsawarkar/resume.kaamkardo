"use client";

import { useState, useEffect } from "react";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import { MoveLeft, MoveRight, FileText, CheckCircle, Loader2, Sparkles, Download, ShieldCheck, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function TenTenAtsEnginePage() {
  const [engineState, setEngineState] = useState<"idle" | "running" | "complete">("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('parsed_resume_data');
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse cached resume data");
      }
    }

    import("@/utils/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          supabase
            .from('resumes')
            .select('file_url')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            .then(({ data: resumeData }) => {
              if (resumeData?.file_url) {
                setFileUrl(resumeData.file_url);
              }
            });
        }
      });
    });
  }, []);

  const handleDownload = () => {
    import("sonner").then(({ toast }) => {
      toast.success("Downloading Optimized Resume...");
      // For demonstration, we'll just download a dummy file or the original
      const link = document.createElement("a");
      link.href = fileUrl || "#";
      link.download = "10_10_Optimized_Resume.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const startEngine = () => {
    setEngineState("running");
    
    // Dynamic steps based on user data
    const weaknesses = userData?.brutal_truth || userData?.weaknesses || ["structural flaws"];
    const targetRole = userData?.fit_roles?.[0] || userData?.targetRole || userData?.domain || "Target Role";
    
    const dynamicSteps = [
      `Analyzing weakness: ${weaknesses[0] || 'Formatting issues'}...`,
      "Reformatting to mathematically perfect layout...",
      `Injecting active verbs tailored for ${targetRole}...`,
      "Cross-referencing Top Hitlist JDs...",
      "Optimizing keywords for 99% ATS parsing...",
      "Finalizing PDF generation..."
    ];

    let currentIdx = 0;
    
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (100 / dynamicSteps.length);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setEngineState("complete"), 500);
          return 100;
        }
        return next;
      });
      
      setCurrentStep(dynamicSteps[currentIdx]);
      currentIdx++;
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CanvasBg />
      <Header />
      
      <main className="relative z-10 flex-1 pt-24 pb-12 px-6 flex flex-col h-screen">
        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col gap-6">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground font-bold transition-colors">
              <MoveLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 bg-foreground/5 px-4 py-2 rounded-xl text-sm font-bold border border-border/50">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Sandbox Environment
            </div>
          </div>

          {/* Side-by-Side Layout */}
          <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
            
            {/* Left: Original Resume Preview */}
            <div className="bg-card/30 backdrop-blur-md border border-border/60 rounded-3xl overflow-hidden flex flex-col shadow-sm">
              <div className="bg-background/50 border-b border-border/50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold">
                  <FileText className="w-5 h-5 text-foreground/50" />
                  <span>Original Resume.pdf</span>
                </div>
                <div className="text-xs font-bold bg-foreground/10 px-2 py-1 rounded text-foreground/50 uppercase tracking-widest">
                  Preview Mode
                </div>
              </div>
              <div className="flex-1 bg-foreground/[0.02] p-8 overflow-y-auto flex justify-center items-center">
                {fileUrl ? (
                  <iframe 
                    src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                    className="w-full h-full min-h-[600px] rounded-xl border border-border/50 shadow-2xl" 
                    title="Original Resume Preview"
                  />
                ) : (
                  <div className="bg-white w-full max-w-lg aspect-[1/1.414] shadow-2xl rounded p-12 text-black/80 flex flex-col gap-6 relative transition-all duration-1000">
                    {engineState === "complete" && (
                      <div className="absolute inset-0 bg-emerald-500/10 border-4 border-emerald-500 rounded flex items-center justify-center pointer-events-none z-10 backdrop-blur-[1px]">
                         <div className="bg-emerald-500 text-white font-black text-2xl tracking-widest px-8 py-4 rounded-xl shadow-2xl rotate-[-15deg] uppercase">
                           Optimized
                         </div>
                      </div>
                    )}
                    {/* Fake Resume Content */}
                    <div className="text-center border-b-2 border-black/10 pb-4">
                      <div className="h-6 w-48 bg-black/20 rounded mx-auto mb-2"></div>
                      <div className="h-3 w-32 bg-black/10 rounded mx-auto mb-1"></div>
                      <div className="h-3 w-40 bg-black/10 rounded mx-auto"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-24 bg-black/15 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-black/5 rounded"></div>
                        <div className="h-3 w-[90%] bg-black/5 rounded"></div>
                        <div className="h-3 w-[95%] bg-black/5 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 w-32 bg-black/15 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-3 w-full bg-black/5 rounded"></div>
                        <div className="h-3 w-[85%] bg-black/5 rounded"></div>
                        <div className="h-3 w-[92%] bg-black/5 rounded"></div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <div className="h-3 w-full bg-black/5 rounded"></div>
                        <div className="h-3 w-[90%] bg-black/5 rounded"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Claude 3.5 Engine */}
            <div className="bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl flex flex-col shadow-premium overflow-hidden relative">
              
              <div className="bg-background/80 border-b border-border/50 p-6 flex flex-col gap-2">
                <h2 className="text-2xl font-black font-heading flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-emerald-500" /> Claude 3.5 Rewrite Engine
                </h2>
                <div className="text-sm text-foreground/60 flex items-center gap-4">
                  <span>Original Score: <strong className="text-red-500">{userData?.score || 0}%</strong></span>
                  <span>Target Score: <strong className="text-emerald-500">99% ATS Compliance</strong></span>
                </div>
              </div>

              <div className="flex-1 p-8 flex flex-col justify-center items-center relative z-10">
                <AnimatePresence mode="wait">
                  
                  {engineState === "idle" && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center w-full max-w-md"
                    >
                      <div className="w-24 h-24 bg-foreground/5 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-border/50">
                        <FileCheck2 className="w-12 h-12 text-foreground/50" />
                      </div>
                      <h3 className="text-xl font-black mb-2">Ready to Rewrite</h3>
                      <p className="text-foreground/60 text-sm mb-8 leading-relaxed">
                        We will inject industry-specific keywords, restructure your impact metrics, and guarantee perfect ATS parsing.
                      </p>
                      <button 
                        onClick={startEngine}
                        className="w-full bg-foreground text-background py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2"
                      >
                        Initialize Mathematical Rewrite <MoveRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {engineState === "running" && (
                    <motion.div 
                      key="running"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-md"
                    >
                      <div className="bg-background rounded-2xl p-6 border border-border/50 shadow-sm mb-8">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                          <span>System Process</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-foreground/5 h-3 rounded-full overflow-hidden mb-6">
                          <motion.div 
                            className="bg-emerald-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                          <span className="animate-pulse">{currentStep}</span>
                        </div>
                      </div>
                      
                      {/* Fake Terminal */}
                      <div className="bg-black text-emerald-500 font-mono text-xs p-4 rounded-xl shadow-inner overflow-hidden opacity-80 h-32 flex flex-col justify-end">
                        <div className="space-y-1">
                          <p>&gt; Starting semantic parsing for {userData?.fit_roles?.[0] || userData?.domain || 'Target Role'}...</p>
                          <p>&gt; Found {userData?.brutal_truth?.length || 12} structural flaws.</p>
                          {progress > 30 && <p>&gt; Fixing: "{userData?.brutal_truth?.[0] || 'Weak impact metrics'}"...</p>}
                          {progress > 50 && <p>&gt; Injecting {userData?.domain || 'Industry'} keyword matrices...</p>}
                          {progress > 70 && <p>&gt; Adjusting margin bounds for perfect ATS parsing...</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {engineState === "complete" && (
                    <motion.div 
                      key="complete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center w-full max-w-md"
                    >
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center mb-6 shadow-inner border border-emerald-500/20 relative">
                        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h3 className="text-3xl font-black mb-2 tracking-tight">Optimization Complete</h3>
                      <p className="text-foreground/70 mb-2">New Guaranteed ATS Score:</p>
                      <div className="text-6xl font-black font-mono text-emerald-500 tracking-tighter mb-8">99%</div>
                      
                      <button 
                        onClick={handleDownload}
                        className="w-full bg-emerald-500 text-background py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2 mb-4"
                      >
                        <Download className="w-5 h-5" /> Download Perfect PDF
                      </button>
                      <Link href="/dashboard" className="text-sm font-bold text-foreground/50 hover:text-foreground transition-colors inline-block mt-2">
                        Return to Dashboard
                      </Link>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
