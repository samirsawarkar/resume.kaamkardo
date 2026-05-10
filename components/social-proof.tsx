"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const stats = [
  { metric: "14,200+", label: "Resumes Analyzed" },
  { metric: "84%↑", label: "Interview Rate" },
  { metric: "60s", label: "Scan Time" },
  { metric: "99%", label: "Satisfaction" },
];

const companies = [
  "Google", "Amazon", "Microsoft", "Meta", "TCS", "Infosys", "Wipro", "Paytm"
];

export default function SocialProof() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
      className="relative z-10 px-6 py-12 md:py-16 border-t border-border/40 bg-card/10 backdrop-blur-sm"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
        
        {/* Metric Stats */}
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1">
              <span className="text-3xl md:text-4xl font-black text-foreground font-heading">
                {s.metric}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-foreground/40">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-px bg-border/40 max-w-2xl" />

        {/* Marquee Trust Badges */}
        <div className="w-full flex flex-col items-center overflow-hidden">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 mb-6">Our users get hired at</p>
          <div className="w-full relative flex items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="flex items-center gap-16 whitespace-nowrap px-8"
            >
              {[...companies, ...companies].map((company, i) => (
                <span key={i} className="text-xl md:text-2xl font-black text-foreground/15 font-heading tracking-tight select-none">
                  {company}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
