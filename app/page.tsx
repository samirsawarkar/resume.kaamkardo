import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import Hero from "@/components/hero";
import FeaturesGrid from "@/components/features-grid";
import Pricing from "@/components/pricing";
import SocialProof from "@/components/social-proof";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

/**
 * resume.kaamkardo.com — High-Conversion Landing Page
 */
export default function ResumeLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-emerald-500/30">
      {/* Fixed canvas background */}
      <CanvasBg />

      {/* Fixed header */}
      <Header />

      {/* Scrollable content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <Hero />

        {/* High-Impact Social Proof */}
        <SocialProof />

        {/* OS Explanation (Replaces old ServiceTabs) */}
        <FeaturesGrid />

        {/* Pricing Conversion */}
        <Pricing />

        {/* Footer CTA */}
        <section className="relative z-10 px-6 py-24 text-center border-t border-border/40 bg-foreground/5">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/90 dark:bg-foreground/10 flex items-center justify-center mb-6 shadow-xl border border-border/30">
              <Image
                src="/resume-logo.png"
                alt="KaamKarDo Resume"
                width={48}
                height={48}
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-heading mb-6">
              Ready to stop getting rejected?
            </h2>
            <p className="text-foreground/60 text-lg mb-10">
              Upload your resume for free. See the truth in 60 seconds.
            </p>
            <Link
              href="/ats-score"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white px-10 py-5 font-bold text-lg hover:bg-emerald-600 transition-colors shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]"
            >
              Get Free ATS Score
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-border/40 bg-background py-8 text-center text-sm text-foreground/40">
        <p>© {new Date().getFullYear()} KaamKarDo. All rights reserved.</p>
      </footer>
    </div>
  );
}
