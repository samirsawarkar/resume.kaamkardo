"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Pricing() {
  return (
    <section className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
          Stop getting rejected. <br/>
          <span className="text-foreground/40">Start getting interviews.</span>
        </h2>
        <p className="text-foreground/50 text-lg">
          Simple pricing. No recurring subscriptions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Free Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-sm p-8 md:p-10 flex flex-col"
        >
          <div className="mb-8">
            <h3 className="text-xl font-bold font-heading text-foreground/80 mb-2">ATS Reality Check</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">₹0</span>
            </div>
            <p className="text-sm text-foreground/50 mt-2">Find out why you're being ignored.</p>
          </div>

          <div className="flex flex-col gap-4 mb-10 flex-1">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Instant ATS Score (0-100)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Brutal Truth Analysis</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Market Salary Prediction</span>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm line-through">10/10 AI Resume Rewrite</span>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm line-through">Top 100 Company Hitlist</span>
            </div>
            <div className="flex items-center gap-3 opacity-40">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm line-through">Kanban Tracker & Cold Emails</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-border/80 bg-background hover:bg-foreground/5 px-6 py-4 font-bold text-sm transition-colors"
          >
            Get Free Score
          </Link>
        </motion.div>

        {/* Pro OS Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-background p-8 md:p-10 flex flex-col relative overflow-hidden shadow-2xl shadow-emerald-500/5"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500"></div>
          
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mb-2">30-Day Job Hunt OS</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Lifetime</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-foreground">₹299</span>
              <span className="text-sm text-foreground/40 line-through">₹999</span>
            </div>
            <p className="text-sm text-foreground/50 mt-2">Everything you need to get hired.</p>
          </div>

          <div className="flex flex-col gap-4 mb-10 flex-1">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm font-bold text-foreground">Everything in Free</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">10/10 AI Resume Rewrite (Harvard Style)</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Top 100 Company Target Hitlist</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Drag-and-Drop Kanban Job Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">1-Click Aggressive Cold Emails</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-sm text-foreground/80">Live Daily Curated Job Feed</span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="group w-full relative inline-flex justify-center items-center gap-2 rounded-xl bg-foreground text-background px-6 py-4 font-bold text-sm hover:scale-[1.02] transition-all overflow-hidden shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">Unlock Pro OS Now</span>
            <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
