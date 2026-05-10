import { createClient } from "@/utils/supabase/client";
import type { Job } from "@/src/types";

export const db = {
  async saveResume(score: number, targetRole: string, analysisJson: any, fileUrl?: string) {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) return null;

    const { data, error } = await supabase
      .from("resumes")
      .insert([
        {
          user_id: userData.user.id,
          score,
          target_role: targetRole,
          analysis_json: analysisJson,
          file_url: fileUrl || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving resume:", error);
      throw new Error("Could not save resume to database.");
    }
    return data;
  },

  async getJobApplications() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) return [];

    const { data, error } = await supabase
      .from("job_applications")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code !== "PGRST205") {
        console.error("Error fetching applications:", error);
      }
      return [];
    }
    return data;
  },

  async addJobApplication(job: Job, status: "applied" | "interviewing" | "offer") {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("job_applications")
      .insert([
        {
          user_id: userData.user.id,
          title: job.title,
          company: job.company || "Unknown Company",
          link: job.link,
          status,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding application:", JSON.stringify(error, null, 2));
      throw new Error(`Could not save application: ${error.message}`);
    }
    return data;
  },

  async updateJobApplicationStatus(id: string, status: "applied" | "interviewing" | "offer") {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating application:", error);
      throw new Error("Could not update application status.");
    }
    return data;
  },

  async logAction(actionType: string) {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) return null;

    const { data, error } = await supabase
      .from("user_actions")
      .insert([
        {
          user_id: userData.user.id,
          action_type: actionType,
        },
      ]);

    if (error) {
      console.error("Error logging action:", error);
    }
    return data;
  },

  async getTodayActionCount(actionType: string) {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) return 0;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from("user_actions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userData.user.id)
      .eq("action_type", actionType)
      .gte("created_at", startOfDay.toISOString());

    if (error) {
      console.error("Error counting actions:", error);
      return 0;
    }
    return count || 0;
  },

  async getFirstResumeDate() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) return null;

    const { data, error } = await supabase
      .from("resumes")
      .select("created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") { // Ignore no rows found error
      console.error("Error fetching first resume:", error);
      return null;
    }
    return data ? new Date(data.created_at) : null;
  }
};
