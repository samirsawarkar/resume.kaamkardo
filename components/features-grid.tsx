"use client";

import { motion } from "framer-motion";
import { Zap, Target, Mail, LayoutDashboard, Brain, Lock } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const features = [
  {
    icon: Brain,
    title: "DeepSeek ATS Parsing",
    description: "Upload your PDF. We extract the exact keywords you're missing to beat HR filters.",
    colSpan: "md:col-span-2",
    bg: "bg-emerald-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-500"
  },
  {
    icon: Target,
    title: "Top 100 Hitlist",
    description: "Get a curated list of exactly who to target based on your parsed skills.",
    colSpan: "md:col-span-1",
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    iconColor: "text-violet-500"
  },
  {
    icon: LayoutDashboard,
    title: "Kanban Job Tracker",
    description: "Never lose track. Drag and drop from 'Applied' to 'Offer' in a permanent visual board.",
    colSpan: "md:col-span-1",
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-500"
  },
  {
    icon: Mail,
    title: "1-Click Cold Email",
    description: "Instantly generate aggressive, professional cold emails to hiring managers with your attached resume.",
    colSpan: "md:col-span-2",
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-500"
  }
];

export default function FeaturesGrid() {
  return (
    <section id="how-it-works" className="relative z-10 px-6 py-24 md:py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4">
          Not just a resume scanner.<br/>
          <span className="text-foreground/40">It's a complete Job Hunt OS.</span>
        </h2>
        <p className="text-foreground/50 max-w-2xl mx-auto text-lg">
          Stop applying into the void. Get your brutal ATS truth, then use our integrated tools to get hired in 30 days.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: EASE }}
            className={`rounded-3xl p-8 border ${feature.bg} ${feature.border} backdrop-blur-sm relative overflow-hidden group hover:bg-foreground/5 transition-colors duration-500 ${feature.colSpan}`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <feature.icon className="w-48 h-48" />
            </div>
            
            <div className={`w-12 h-12 rounded-xl bg-background border ${feature.border} flex items-center justify-center mb-6 shadow-sm`}>
              <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
            </div>
            
            <h3 className="text-xl font-bold font-heading mb-3">{feature.title}</h3>
            <p className="text-foreground/60 leading-relaxed text-sm md:text-base">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
