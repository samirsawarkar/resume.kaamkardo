"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Zap,
  CheckCircle,
  TrendingUp,
  Lock,
  FileText,
  Users,
  Kanban,
  Mail,
  Rss,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  {
    id: "free",
    label: "Free ATS Score",
    icon: Zap,
    badge: "Free",
    badgeColor: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "paid",
    label: "₹299 Job Hunt OS",
    icon: Lock,
    badge: "₹299",
    badgeColor: "bg-violet-500/10 text-violet-500",
  },
] as const;

// ── Free tier panel ───────────────────────────────────────────
function FreeTierPanel() {
  return (
    <div className="flex flex-col gap-8">
      {/* Visual */}
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
          <div className="text-5xl font-black text-emerald-500 font-heading">
            72
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {/* ATS label */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 bg-background px-2">
            ATS Score
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="text-center">
        <h3 className="text-2xl font-black font-heading mb-2">
          The Reality Check — Free
        </h3>
        <p className="text-foreground/50 text-sm leading-relaxed">
          Upload your PDF or DOCX. Our AI reads it in seconds and gives you
          the honest truth.
        </p>
      </div>

      {/* Steps */}
      <div className="grid gap-3">
        {[
          {
            icon: Upload,
            title: "Drag & Drop Your Resume",
            desc: "PDF or DOCX — up to 5MB. We handle the parsing.",
          },
          {
            icon: Zap,
            title: "Instant ATS Score (0–100)",
            desc: "DeepSeek grades your resume on impact, formatting & keyword density.",
          },
          {
            icon: TrendingUp,
            title: "The Brutal Truth Report",
            desc: '3 bullets telling you exactly why HR is rejecting you (e.g., "2-column layout breaks ATS parsers").',
          },
          {
            icon: CheckCircle,
            title: "Market Value Predictor",
            desc: 'See your real earning potential vs. what your resume projects (e.g., "You should be at ₹6L, not ₹3L").',
          },
        ].map((step) => (
          <div
            key={step.title}
            className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <step.icon className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {step.title}
              </div>
              <div className="text-xs text-foreground/50 mt-0.5 leading-relaxed">
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/ats-score"
          id="free-upload-cta"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Upload Resume — It's Free
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-foreground/35">
          No sign-up required. Instant result.
        </p>
      </div>
    </div>
  );
}

// ── Paid tier panel ───────────────────────────────────────────
function PaidTierPanel() {
  const features = [
    {
      icon: FileText,
      title: "10/10 ATS Resume Generator",
      desc: 'Premium AI rewrites your bullets into "Action-Result" format. Exports a clean ATS-safe PDF.',
      tag: "AI Writing",
    }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Visual / price callout */}
      <div className="flex items-center justify-center">
        <div className="relative rounded-3xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 px-8 py-6 text-center">
          <div className="text-4xl font-black font-heading text-foreground mb-1">
            ₹299
          </div>
          <div className="text-sm text-foreground/50">
            Complete 30-Day Job Hunt OS
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-violet-500/80 bg-background px-2">
            One-time Payment
          </div>
        </div>
      </div>

      {/* Headline */}
      <div className="text-center">
        <h3 className="text-2xl font-black font-heading mb-2">
          The Complete Job Hunt System
        </h3>
        <p className="text-foreground/50 text-sm leading-relaxed">
          Everything you need to go from "zero callbacks" to "3 offers" in
          30 days.
        </p>
      </div>

      {/* Feature list */}
      <div className="grid gap-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <f.icon className="w-4 h-4 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm font-semibold text-foreground">
                  {f.title}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400/70 bg-violet-400/10 rounded-full px-2 py-0.5">
                  {f.tag}
                </span>
              </div>
              <div className="text-xs text-foreground/50 mt-0.5 leading-relaxed">
                {f.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ ease: EASE, duration: 0.3 }}
          id="paid-unlock-cta"
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Unlock 30-Day Sprint — ₹299
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <a
          href="#free-upload-cta"
          className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors inline-flex items-center gap-1"
        >
          Start with the free score first
          <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function ServiceTabs() {
  const [active, setActive] = useState<"free" | "paid">("free");

  return (
    <section className="relative z-10 px-6 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-sm mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
              style={{
                color:
                  active === tab.id
                    ? "var(--foreground)"
                    : "color-mix(in srgb, var(--foreground) 40%, transparent)",
              }}
            >
              {/* Active pill indicator */}
              {active === tab.id && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-xl bg-background border border-border/80 shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="rounded-3xl bg-card/50 border border-border/60 backdrop-blur-sm p-6 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {active === "free" ? <FreeTierPanel /> : <PaidTierPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
