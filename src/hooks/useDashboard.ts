import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Job, KanbanState, ParsedResumeData } from "@/src/types";
import { db } from "@/src/services/db";
import { createClient } from "@/utils/supabase/client";

export function useDashboard() {
  const [user, setUser] = useState<any>(null);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rateLimited, setRateLimited] = useState(false);
  
  const [parsedRole, setParsedRole] = useState("Professional");
  const [atsScore, setAtsScore] = useState(0);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [kanban, setKanban] = useState<KanbanState>({
    applied: [],
    interviewing: [],
    offer: [],
  });

  const [currentDay, setCurrentDay] = useState(1);
  const [todayApplicationsCount, setTodayApplicationsCount] = useState(0);
  const [todayEmailsCount, setTodayEmailsCount] = useState(0);

  // Check localStorage for previous session
  useEffect(() => {
    const savedData = localStorage.getItem("parsed_resume_data");
    const rawText = localStorage.getItem("raw_resume_text");
    if (savedData && rawText) {
      try {
        const result: ParsedResumeData = JSON.parse(savedData);
        setAtsScore(result.score || 0);
        setParsedRole(result.fit_roles?.[0] || result.domain || result.targetRole || "Professional");
        setWeaknesses(result.brutal_truth || result.weaknesses || []);
        setStrengths(result.top_skills || result.strengths || []);
        setHasUploadedResume(true);
      } catch (e) {
        console.error("Failed to parse cached resume data");
      }
    }
    
    // Fetch user and tier
    const supabase = createClient();
    
    const fetchUserAndTier = async (sessionUser: any) => {
      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', sessionUser.id)
          .single();
          
        setUser({ ...sessionUser, tier: profile?.tier || 'free' });

        // Also fetch the latest uploaded resume from DB if it exists
        const { data: latestResume } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', sessionUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (latestResume && latestResume.file_url) {
          setFileUrl(latestResume.file_url);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // Initial fetch
    supabase.auth.getUser().then(({ data }) => {
      fetchUserAndTier(data?.user);
    });

    // Listen for changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndTier(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Manual job search function
  const searchJobs = async (role: string, location?: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: role, location }),
      });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      
      const data = await res.json();
      setJobs(data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);
    setRateLimited(false);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      let publicUrl = null;

      if (userData?.user) {
        // Upload to Supabase Storage
        const filePath = `${userData.user.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          // Non-fatal, we'll continue with parsing but file won't be saved
        } else {
          const { data: urlData } = supabase.storage.from("resumes").getPublicUrl(filePath);
          publicUrl = urlData.publicUrl;
          setFileUrl(publicUrl);
        }
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 429) {
          setRateLimited(true);
          throw new Error("RATE_LIMIT");
        }
        throw new Error(errData.error || "Failed to parse resume.");
      }

      const data = await res.json();
      setParsedRole(data.targetRole || "Professional");
      setAtsScore(data.atsScore || 0);
      setStrengths(data.strengths || []);
      setWeaknesses(data.weaknesses || []);
      
      // Save to localStorage
      localStorage.setItem("parsed_resume_data", JSON.stringify(data));
      if (data.extractedText) {
        localStorage.setItem("raw_resume_text", data.extractedText);
      }
      setHasUploadedResume(true);
      toast.success("Resume parsed and uploaded successfully");

      // Save to Supabase in the background
      db.saveResume(data.atsScore || 0, data.targetRole || "Professional", data, publicUrl || undefined).catch(console.error);
    } catch (err: any) {
      console.error(err);
      if (err.message !== "RATE_LIMIT") {
        toast.error(err.message || "Error analyzing resume.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const moveToKanban = async (job: Job, status: "applied" | "interviewing" | "offer") => {
    // Optimistic UI update
    setKanban(prev => ({
      ...prev,
      [status]: [...prev[status], job]
    }));
    setJobs(prev => prev.filter(j => j.link !== job.link));
    
    toast.success(`Moved ${job.title} to ${status}`);

    // Increment today's application count optimistic
    setTodayApplicationsCount(prev => prev + 1);

    try {
      await db.addJobApplication(job, status);
    } catch (e) {
      toast.error("Failed to save application to database");
      setTodayApplicationsCount(prev => prev - 1);
    }
  };

  // Fetch initial kanban data and metrics
  useEffect(() => {
    let isMounted = true;
    
    const fetchMetrics = async () => {
      try {
        // Fetch Kanban apps
        const apps = await db.getJobApplications();
        if (!isMounted) return;
        
        if (apps) {
          const newKanban: KanbanState = { applied: [], interviewing: [], offer: [] };
          let todayCount = 0;
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          apps.forEach(app => {
            if (newKanban[app.status as keyof KanbanState]) {
              newKanban[app.status as keyof KanbanState].push({
                title: app.title,
                company: app.company || undefined,
                link: app.link
              });
            }
            if (new Date(app.created_at) >= startOfDay) {
              todayCount++;
            }
          });
          setKanban(newKanban);
          setTodayApplicationsCount(todayCount);
        }

        // Fetch Day and Email Actions
        if (hasUploadedResume || user) {
          const firstDate = await db.getFirstResumeDate();
          if (firstDate) {
            const diffTime = Math.abs(new Date().getTime() - firstDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
            setCurrentDay(diffDays);
          }
          
          const emailsCount = await db.getTodayActionCount("cold_email");
          setTodayEmailsCount(emailsCount);
        }

      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    return () => { isMounted = false; };
  }, [user, hasUploadedResume]);

  const generateColdMail = (job: Job) => {
    navigator.clipboard.writeText(`Subject: Perfect match for ${job.title} role\n\nHi Hiring Manager,\nI saw the opening for ${job.title} and based on my 10/10 ATS score, I am a perfect fit. I've attached my mathematically perfect resume.\n\nBest,\n[Your Name]`);
    toast.success("Cold email template copied to clipboard!");
    
    // Log action and increment
    db.logAction("cold_email");
    setTodayEmailsCount(prev => prev + 1);
  };

  const updateDbStatus = async (id: string, status: "applied" | "interviewing" | "offer") => {
    try {
      await db.updateJobApplicationStatus(id, status);
    } catch (e) {
      toast.error("Failed to update status in DB");
    }
  };

  return {
    hasUploadedResume,
    isUploading,
    loading,
    rateLimited,
    parsedRole,
    atsScore,
    strengths,
    weaknesses,
    fileName,
    fileUrl,
    jobs,
    kanban,
    handleFileUpload,
    moveToKanban,
    generateColdMail,
    setKanban,
    updateDbStatus,
    searchJobs,
    currentDay,
    todayApplicationsCount,
    todayEmailsCount,
    user
  };
}
