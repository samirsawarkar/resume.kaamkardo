"use client";

import { useState, Suspense, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  
  const supabase = createClient();
  const [isAlreadyLogged, setIsAlreadyLogged] = useState(false);
  
  // Auto-redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAlreadyLogged(true);
        router.push(nextPath);
      }
    });
  }, [nextPath, router, supabase]);

  if (isAlreadyLogged) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl shadow-premium">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
        <p className="text-lg font-bold font-heading">Redirecting to OS...</p>
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${nextPath}`
          }
        });
        if (error) throw error;
        setSuccessMsg("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextPath);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check your config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-8 shadow-premium">
      <h1 className="text-3xl font-black font-heading mb-2 text-center">
        {isSignUp ? "Create OS Account" : "Welcome Back"}
      </h1>
      <p className="text-foreground/60 text-center mb-8 text-sm">
        {isSignUp ? "Sign up to initialize your Job Hunt OS" : "Sign in to your Job Hunt OS"}
      </p>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            required
            minLength={6}
          />
        </div>
        
        {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}
        {successMsg && <p className="text-emerald-500 text-xs font-bold bg-emerald-500/10 p-3 rounded-lg">{successMsg}</p>}
        
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isSignUp ? "Sign Up" : "Sign In"} <ArrowRight className="w-4 h-4" /></>}
        </button>
        
        <div className="text-center mt-6 pt-4 border-t border-border/50">
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMsg(null); }}
            className="text-sm font-bold text-foreground/50 hover:text-foreground transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CanvasBg />
      <Header />
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <Suspense fallback={<div className="flex items-center justify-center w-full max-w-md h-[400px] bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl"><Loader2 className="w-8 h-8 animate-spin text-foreground/50" /></div>}>
          <LoginContent />
        </Suspense>
      </main>
    </div>
  );
}
