"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { Sun, Moon, FileText, LogOut, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const scrollY = useMotionValue(0);
  const [user, setUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    const fetchUserAndTier = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tier')
          .eq('id', session.user.id)
          .single();
        setUser({ ...session.user, tier: profile?.tier || 'free' });
      } else {
        setUser(null);
      }
    };

    fetchUserAndTier();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUserAndTier();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription.unsubscribe();
    };
  }, [scrollY]);

  // Shrink padding on scroll
  const py = useTransform(scrollY, [0, 80], ["1.5rem", "1rem"]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingTop: py, paddingBottom: py }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/90"
    >
      <div className="max-w-7xl w-full mx-auto px-6 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shrink-0 group-hover:bg-foreground/90 transition-colors">
            <FileText
              className="w-5 h-5 text-background"
              strokeWidth={2.2}
            />
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-sm font-bold tracking-tight text-foreground font-heading leading-none">
              resume
            </span>
            <span className="text-[11px] text-foreground/40 font-sans leading-none">
              kaamkardo.com
            </span>
          </div>
        </Link>

        {/* Right side: Nav + Controls */}
        <div className="flex items-center justify-end gap-2 md:gap-4 flex-1 min-w-0">
          
          {/* Scrollable Nav Links */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-6 ml-auto">
            <Link
              href="/ats-score"
              className="text-xs md:text-sm font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full shrink-0 transition-transform hover:scale-105 border border-emerald-500/20"
            >
              Free ATS Score
            </Link>
            <Link
              href="/dashboard#10-10-ats"
              className="text-xs md:text-sm font-bold bg-foreground text-background px-3 py-1.5 rounded-full shrink-0 transition-transform hover:scale-105"
            >
              10/10 ATS
            </Link>
            <Link
              href="/dashboard#hitlist"
              className="text-xs md:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors shrink-0"
            >
              Top Hitlist
            </Link>
            <Link
              href="/dashboard#kanban"
              className="text-xs md:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors shrink-0"
            >
              Job Kanban Tracker
            </Link>
            <Link
              href="/dashboard#cold-mail"
              className="text-xs md:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors shrink-0"
            >
              1-Click Cold Mail
            </Link>
            <Link
              href="/dashboard#daily-feed"
              className="text-xs md:text-sm font-medium text-foreground/60 hover:text-foreground transition-colors shrink-0"
            >
              Daily Curated Job Feed
            </Link>
          </div>

          <div className="w-px h-4 bg-border shrink-0 hidden md:block" />

          {/* Pinned Controls: Profile & Theme */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {mounted && user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 shrink-0 bg-card hover:bg-foreground/5 border border-border/50 rounded-full pl-3 pr-1 py-1 shadow-sm transition-colors"
                >
                  <div className="flex flex-col items-end justify-center hidden sm:flex">
                    {user.tier === 'pro' ? (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 leading-none mb-0.5">Pro OS Active</span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 leading-none mb-0.5">Free Tier</span>
                    )}
                    <span className="text-xs font-medium text-foreground/80 truncate max-w-[100px] leading-none">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs uppercase border border-emerald-500/20">
                    {user.email?.[0] || "U"}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/40 rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col"
                    >
                      <div className="p-4 border-b border-border/40 bg-background/50">
                        <p className="text-xs font-medium text-foreground/50 mb-1">Signed in as</p>
                        <p className="text-sm font-bold truncate" title={user.email}>{user.email}</p>
                      </div>
                      
                      <div className="p-4 border-b border-border/40 flex flex-col gap-2">
                        <p className="text-xs font-medium text-foreground/50 mb-1">Subscription</p>
                        {user.tier === 'pro' ? (
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                            <CheckCircle className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider">Lifetime Pro OS</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-foreground/60 bg-foreground/5 px-3 py-2 rounded-xl border border-border/40">
                              <span className="text-xs font-bold uppercase tracking-wider">Free Tier</span>
                            </div>
                            <Link 
                              href="/checkout"
                              onClick={() => setIsProfileOpen(false)}
                              className="text-xs font-bold text-center bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition-colors shadow-sm"
                            >
                              Upgrade to Pro
                            </Link>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.reload();
                          }}
                          className="w-full flex items-center gap-2 text-red-500 hover:bg-red-500/10 px-3 py-2.5 rounded-xl transition-colors text-sm font-bold"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            ) : (
              mounted && (
                <div className="flex items-center gap-3 shrink-0">
                  <Link href="/login" className="text-xs font-bold text-foreground hover:text-foreground/80 transition-colors">
                    Sign In
                  </Link>
                </div>
              )
            )}
            
            {/* Theme toggle */}
            {mounted && (
              <motion.button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-colors duration-200 border border-transparent hover:border-border/50 shrink-0"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
