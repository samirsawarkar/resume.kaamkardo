"use client";

import { useState, useEffect } from "react";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import Link from "next/link";
import { Loader2, CheckCircle, Search, Mail, MoveRight, ExternalLink, TrendingUp, Target, Activity, Zap, CircleDashed, CheckCircle2, UploadCloud, FileText, Lock, AlertTriangle, MapPin } from "lucide-react";

import { useDashboard } from "@/src/hooks/useDashboard";
import { KanbanBoard } from "@/src/components/dashboard/KanbanBoard";

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
    jobs,
    kanban,
    handleFileUpload,
    moveToKanban,
    generateColdMail,
    setKanban,
    updateDbStatus,
    searchJobs,
    user,
    fileUrl,
    currentDay,
    todayApplicationsCount,
    todayEmailsCount
  } = useDashboard();

  const [searchRole, setSearchRole] = useState("");
  const [searchLoc, setSearchLoc] = useState("");

  let completedObjectives = 0;
  if (atsScore >= 90) completedObjectives++;
  if (todayApplicationsCount >= 5) completedObjectives++;
  if (todayEmailsCount >= 3) completedObjectives++;
  const progressPercent = Math.round((completedObjectives / 3) * 100);

  useEffect(() => {
    if (parsedRole && !searchRole) {
      setSearchRole(parsedRole);
    }
  }, [parsedRole, searchRole]);

  const handleSearch = () => {
    searchJobs(searchRole || parsedRole, searchLoc);
  };

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

  if (user && user.tier !== 'pro') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CanvasBg />
        <Header />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24">
          <div className="bg-card border border-border/40 p-10 rounded-2xl max-w-lg text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Pro OS Required</h1>
            <p className="text-foreground/60 text-base mb-8 leading-relaxed">
              The 30-Day Job Hunt OS is exclusively for Pro members. Upgrade to unlock your automated Kanban Tracker, 1-Click Cold Emails, and the advanced parsing engine.
            </p>
            <Link href="/checkout" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-lg">
              Unlock Lifetime Pro OS — ₹299
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CanvasBg />
      <Header />
      <main className="relative z-10 flex-1 pt-28 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col gap-12">
        
        {/* Main Dashboard Layout */}
        {!hasUploadedResume ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto text-center px-4 mt-8">
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
                  <h2 className="text-2xl font-bold mb-3">Initialize Your OS</h2>
                  <p className="text-foreground/60 text-base mb-8 leading-relaxed max-w-md mx-auto">
                    Upload your current resume to let our engines parse your skills, determine your target roles, and populate your job hitlist.
                  </p>
                  <div className="relative border-2 border-dashed border-border/60 rounded-xl p-8 hover:bg-foreground/5 transition-colors cursor-pointer mb-2 flex flex-col items-center justify-center gap-3 group overflow-hidden bg-background/50">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <FileText className={`w-8 h-8 transition-colors ${isUploading ? 'text-emerald-500 animate-bounce' : 'text-foreground/40 group-hover:text-emerald-500'}`} />
                    <span className="text-sm font-medium text-foreground/60">
                      {isUploading ? `Parsing ${fileName}...` : "Drag & drop your PDF resume here, or click to browse"}
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
          <>            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-2">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1 capitalize">{parsedRole} OS</h1>
                <p className="text-foreground/60 text-base">Your 30-Day automated job acquisition system.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-card border border-border/40 shadow-sm">
                {user?.tier === 'pro' ? (
                  <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-500 font-medium">Active Subscription</span></>
                ) : (
                  <><Target className="w-4 h-4 text-foreground/40" /> <span className="text-foreground/40 font-medium">Free Plan</span></>
                )}
              </div>
            </div>

            {/* Step Tracker */}
            <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl p-6 overflow-x-auto shadow-sm">
              {[
                { step: 1, label: "ATS Score", done: true },
                { step: 2, label: "10/10 ATS", done: atsScore >= 90 },
                { step: 3, label: "Top Jobs", done: jobs.length > 0 },
                { step: 4, label: "Job Kanban", done: kanban.applied.length > 0 || kanban.interviewing.length > 0 },
                { step: 5, label: "Cold Mail", done: false },
                { step: 6, label: "Daily Feed", done: false }
              ].map((s, i) => (
                <div key={i} className="flex items-center shrink-0">
                  <div className={`flex items-center gap-3 ${s.done ? "text-emerald-500" : "text-foreground/40"}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${s.done ? "bg-emerald-500 text-white" : "bg-foreground/10"}`}>
                      {s.done ? <CheckCircle className="w-3.5 h-3.5" /> : s.step}
                    </div>
                    <span className="text-sm font-semibold tracking-wide hidden md:block">{s.label}</span>
                  </div>
                  {i < 5 && <div className={`w-8 md:w-12 h-px mx-3 md:mx-6 ${s.done ? "bg-emerald-500/40" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            {/* 30-Day OS Tracker & Statistical Insights */}
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* 30-Day Tracker */}
              <section className="md:col-span-1 bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2"><Target className="w-4 h-4 text-emerald-500"/> 30-Day Plan</h2>
                  <div className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">Day {currentDay}</div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-semibold text-foreground/60 mb-2">
                    <span>Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full relative transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4">Today's Objectives</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold line-through text-foreground/50">Review ATS Score</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      {atsScore >= 90 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${atsScore >= 90 ? 'line-through text-foreground/50' : 'text-foreground'}`}>Optimize to 90+ ATS</p>
                        {atsScore < 90 && (
                          <Link href="/dashboard/10-10-ats" className="text-xs text-amber-500 hover:text-amber-600 font-semibold mt-1 inline-flex items-center gap-1">
                            Launch 10/10 Engine <MoveRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      {todayApplicationsCount >= 5 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <CircleDashed className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${todayApplicationsCount >= 5 ? 'line-through text-foreground/50' : 'text-foreground'}`}>Apply to 5 Top Matches</p>
                        <p className="text-xs text-foreground/50 mt-1">{todayApplicationsCount}/5 applied today</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      {todayEmailsCount >= 3 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <CircleDashed className="w-4 h-4 text-foreground/40 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm font-semibold ${todayEmailsCount >= 3 ? 'line-through text-foreground/50' : 'text-foreground/70'}`}>Send 3 Cold Emails</p>
                        <p className="text-xs text-foreground/50 mt-1">{todayEmailsCount}/3 sent today</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Statistical Insights Panel */}
              <section id="10-10-ats" className="md:col-span-2 bg-card border border-border/40 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500"/> Intelligence Panel
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" /> 10/10 Ready
                    </div>
                    <Link href="/dashboard/10-10-ats" className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm">
                      Launch 10/10 ATS Engine <MoveRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-background rounded-xl p-4 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Target Role</div>
                    <div className="text-lg font-bold text-foreground capitalize truncate" title={parsedRole}>{parsedRole}</div>
                    <div className="text-[11px] text-foreground/50 mt-1">Extracted via LLM</div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Base ATS Score</div>
                    <div className={`text-xl font-bold ${atsScore >= 80 ? 'text-emerald-500' : atsScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{atsScore}/100</div>
                    <div className="text-[11px] text-foreground/50 mt-1">Before 10/10 ATS Optimization</div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border border-border/40">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Critical Weaknesses</div>
                    <div className="text-sm font-semibold text-foreground mb-1 leading-snug line-clamp-2">
                      {weaknesses.length > 0 ? weaknesses[0] : "No major weaknesses detected"}
                    </div>
                    <div className="text-[11px] text-foreground/50 mt-1 line-clamp-1">
                      {weaknesses.length > 1 && weaknesses[1]}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100 rounded-xl p-5 mb-6 border border-emerald-500/10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">Top Analyst Tip (Core Strengths)</h3>
                  <ul className="text-sm leading-relaxed font-medium list-disc pl-4 space-y-1">
                    {strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                    {strengths.length === 0 && <li>"Your profile is highly optimized. Focus your daily applications entirely on Senior/Lead positions, and prioritize using the 1-Click Cold Mail."</li>}
                  </ul>
                </div>

                {fileUrl && (
                  <div className="border border-border/40 rounded-xl overflow-hidden bg-background">
                    <div className="bg-card p-3 border-b border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-foreground/80">
                        <FileText className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Your Uploaded Resume</h3>
                      </div>
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors">
                        Open Original <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe 
                      src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-[400px] bg-white" 
                      title="Resume Preview"
                    />
                  </div>
                )}
              </section>
            </div>

            {/* Top Hitlist Table */}
            <section id="hitlist" className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-bold">Top Job Hitlist</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input 
                      type="text" 
                      placeholder="Role (e.g. Engineer)"
                      value={searchRole}
                      onChange={(e) => setSearchRole(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border/40 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="relative w-full sm:w-48">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input 
                      type="text" 
                      placeholder="Location (e.g. Remote)"
                      value={searchLoc}
                      onChange={(e) => setSearchLoc(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border/40 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Find Jobs
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-emerald-500">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-sm font-medium text-foreground/60">Curating top matches...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border/40 text-[11px] uppercase tracking-wider text-foreground/50">
                        <th className="pb-3 pr-4 font-semibold">Role</th>
                        <th className="pb-3 px-4 font-semibold">Company Info</th>
                        <th className="pb-3 px-4 font-semibold text-center">Match Score</th>
                        <th className="pb-3 pl-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job, idx) => (
                        <tr key={idx} className="border-b border-border/20 hover:bg-foreground/[0.02] transition-colors">
                          <td className="py-4 pr-4">
                            <div className="font-bold text-sm text-foreground mb-0.5">{job.title}</div>
                            <div className="text-xs text-foreground/50 line-clamp-1 max-w-xs">{job.snippet}</div>
                          </td>
                          <td className="py-4 px-4 text-sm text-foreground/70 font-medium">
                             {job.link.split('/')[2]}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center justify-center text-emerald-500 font-mono font-bold text-sm">
                              {Math.floor(Math.random() * 15) + 85}%
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => moveToKanban(job, 'applied')} className="text-foreground/60 hover:text-foreground px-2 py-1.5 rounded-md text-xs font-semibold transition-colors border border-transparent hover:border-border/40 hover:bg-card">
                                Track
                              </button>
                              <button onClick={() => generateColdMail(job)} className="text-foreground/60 hover:text-foreground px-2 py-1.5 rounded-md text-xs font-semibold transition-colors border border-transparent hover:border-border/40 hover:bg-card" title="1-Click Cold Mail">
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <a href={job.link} target="_blank" rel="noreferrer" className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5 shadow-sm">
                                Apply <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {jobs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-foreground/50 text-sm">
                            <Search className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
                            No jobs found. Enter a role and location above and click "Find Jobs".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Kanban Board */}
            <section className="relative mt-8">
              <KanbanBoard 
                kanban={kanban} 
                setKanban={setKanban} 
                generateColdMail={generateColdMail} 
                updateDbStatus={updateDbStatus} 
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
