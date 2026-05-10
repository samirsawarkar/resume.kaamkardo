import { CheckCircle, Mail, MoveRight } from "lucide-react";
import type { Job, KanbanState } from "@/src/types";

interface KanbanBoardProps {
  kanban: KanbanState;
  setKanban: React.Dispatch<React.SetStateAction<KanbanState>>;
  generateColdMail: (job: Job) => void;
  updateDbStatus: (id: string, status: "applied" | "interviewing" | "offer") => Promise<void>;
}

export function KanbanBoard({ kanban, setKanban, generateColdMail, updateDbStatus }: KanbanBoardProps) {
  
  const handleStatusChange = async (job: Job, from: keyof KanbanState, to: "interviewing" | "offer") => {
    // Optimistic UI update
    setKanban(p => ({
      ...p,
      [from]: p[from].filter(j => j.link !== job.link),
      [to]: [...p[to], job]
    }));
    
    // Attempt DB update
    // Note: To properly update DB, we need the application ID. For now, since the hook doesn't 
    // keep track of DB IDs in the Job type, this is a placeholder. 
    // In a full implementation, `job` would contain `id`.
  };

  return (
    <section id="kanban" className="mb-12">
      <h2 className="text-2xl font-black font-heading mb-6">Job Kanban Tracker</h2>
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Column 1: Applied */}
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
            <h3 className="font-bold text-foreground/70 uppercase tracking-widest text-xs">Applied</h3>
            <span className="bg-foreground/10 text-xs font-bold px-2 py-0.5 rounded">{kanban.applied.length}</span>
          </div>
          <div className="space-y-4">
            {kanban.applied.map((job, idx) => (
              <div key={idx} className="bg-background border border-border/50 p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-1">{job.title}</h4>
                <p className="text-xs text-foreground/50 mb-3 truncate">{job.link.split('/')[2]}</p>
                <div className="flex gap-2">
                  <button onClick={() => generateColdMail(job)} className="text-xs bg-foreground/5 hover:bg-foreground/10 px-2 py-1 rounded font-medium flex items-center gap-1"><Mail className="w-3 h-3"/> Follow up</button>
                  <button onClick={() => handleStatusChange(job, 'applied', 'interviewing')} className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold ml-auto flex items-center gap-1">Interview <MoveRight className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Interviewing */}
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
            <h3 className="font-bold text-violet-500/70 uppercase tracking-widest text-xs">Interviewing</h3>
            <span className="bg-violet-500/10 text-violet-500 text-xs font-bold px-2 py-0.5 rounded">{kanban.interviewing.length}</span>
          </div>
          <div className="space-y-4">
            {kanban.interviewing.map((job, idx) => (
              <div key={idx} className="bg-background border border-violet-500/30 p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-1">{job.title}</h4>
                <p className="text-xs text-foreground/50 mb-3 truncate">{job.link.split('/')[2]}</p>
                <button onClick={() => handleStatusChange(job, 'interviewing', 'offer')} className="w-full text-xs bg-violet-500 text-background px-2 py-1.5 rounded font-bold flex items-center justify-center gap-1">Got Offer <CheckCircle className="w-3 h-3"/></button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Offer */}
        <div className="bg-card/30 border border-border/60 rounded-3xl p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-2">
            <h3 className="font-bold text-amber-500/70 uppercase tracking-widest text-xs">Offer Received</h3>
            <span className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2 py-0.5 rounded">{kanban.offer.length}</span>
          </div>
          <div className="space-y-4">
            {kanban.offer.map((job, idx) => (
              <div key={idx} className="bg-background border border-amber-500/50 p-4 rounded-xl shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-amber-500/5 pointer-events-none"></div>
                <h4 className="font-bold text-sm mb-1">{job.title}</h4>
                <p className="text-xs text-foreground/50 truncate">{job.link.split('/')[2]}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
