"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, FileText, BarChart, LayoutDashboard, Target } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

export default function Hero() {
  return (
    <section className="relative z-10 pt-32 pb-16 md:pt-40 md:pb-24 flex flex-col items-center text-center px-6 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center gap-6 max-w-4xl relative z-10"
      >
        {/* Urgency badge */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs md:text-sm text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>
              DeepSeek AI Engine v2.0 Live — <strong className="font-bold">Instant Feedback</strong>
            </span>
          </div>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[1.05] font-heading mt-4"
        >
          Your resume is{" "}
          <br className="hidden md:block" />
          <span className="text-foreground/30 bg-clip-text">costing you jobs.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-foreground/60 max-w-2xl leading-relaxed mt-2"
        >
          Stop guessing. Get a brutal ATS score in seconds. Find out exactly why HR is rejecting you, and unlock your ultimate{" "}
          <strong className="text-foreground font-bold">30-Day Job Hunt OS</strong>.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-8 py-4 font-bold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Get Free ATS Score</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent border border-border/60 text-foreground/80 hover:text-foreground hover:bg-foreground/5 px-8 py-4 font-bold text-sm sm:text-base transition-all duration-300"
          >
            See How It Works
          </Link>
        </motion.div>
        <motion.p variants={itemVariants} className="text-xs text-foreground/40 mt-2">
          Takes exactly 60 seconds. No credit card required.
        </motion.p>
      </motion.div>

      {/* Abstract Animated Mockup / Graphic */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.4, ease: EASE }}
        className="mt-20 w-full max-w-5xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 bottom-0 h-full pointer-events-none" />
        
        <div className="relative rounded-2xl md:rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col md:flex-row p-4 md:p-8 gap-6 md:gap-12 mx-4 md:mx-0">
          
          {/* Mock Document */}
          <div className="flex-1 bg-background/80 rounded-xl border border-border/50 p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="w-1/3 h-4 bg-foreground/10 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center"><FileText className="w-4 h-4 text-foreground/40" /></div>
            </div>
            <div className="w-full h-2 bg-foreground/5 rounded-full" />
            <div className="w-5/6 h-2 bg-foreground/5 rounded-full" />
            <div className="w-4/6 h-2 bg-foreground/5 rounded-full mb-4" />
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground/5 shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <div className="w-full h-2 bg-foreground/5 rounded-full" />
                <div className="w-4/5 h-2 bg-foreground/5 rounded-full" />
              </div>
            </div>

            {/* Scanning Laser Animation */}
            <motion.div 
              animate={{ y: ["0%", "400%", "0%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20"
              style={{ top: "10%" }}
            />
          </div>

          {/* Mock Dashboard Insights */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shrink-0 border border-emerald-500/30">
                <span className="text-2xl font-black text-emerald-500">72</span>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">ATS Score Calculated</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">Your formatting is hurting your parse rate. We found 3 major issues.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <Target className="w-6 h-6 text-violet-500 mb-2" />
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Target Role</span>
                <span className="text-sm font-bold">Product Manager</span>
              </div>
              <div className="flex-1 bg-card border border-border/50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <BarChart className="w-6 h-6 text-amber-500 mb-2" />
                <span className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">Top Hitlist</span>
                <span className="text-sm font-bold">142 Matches</span>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-foreground/5 flex items-center justify-center"><LayoutDashboard className="w-4 h-4 text-foreground/60" /></div>
                <span className="text-sm font-bold">Kanban Initialized</span>
              </div>
              <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">Ready</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
