"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout/mock", {
        method: "POST",
      });

      if (!res.ok) {
        let errData = { error: "Payment simulation failed" };
        try {
          errData = await res.json();
        } catch (e) {}
        throw new Error(errData.error || "Payment simulation failed");
      }

      toast.success("Payment Successful! Pro OS Unlocked.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "An error occurred during checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Side: Product Info */}
      <div className="flex-1 bg-foreground/5 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck className="w-64 h-64" />
        </div>
        <div className="max-w-md mx-auto w-full relative z-10">
          <h1 className="text-3xl font-black font-heading mb-2">KaamKarDo Pro OS</h1>
          <p className="text-foreground/50 mb-8">Lifetime access to your 30-Day Job Hunt OS.</p>
          
          <div className="bg-card/50 backdrop-blur-md border border-border/50 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-border/50">
              <span className="font-bold text-foreground/80">Total Due Today</span>
              <span className="text-3xl font-black text-foreground">₹299</span>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">10/10 AI Resume Generation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">Top 100 Company Hitlist</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">Drag & Drop Kanban Tracker</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">1-Click Aggressive Cold Emails</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-foreground/40 text-xs">
            <Lock className="w-4 h-4" />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      {/* Right Side: Payment Form (Simulated) */}
      <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-card">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-xl font-bold mb-6">Payment Details</h2>
          
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm mb-8">
            <strong>Test Mode Active:</strong> No real money will be charged. Click the button below to simulate a successful payment and instantly upgrade your account.
          </div>

          <div className="space-y-4 mb-8 opacity-50 pointer-events-none">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">Card Information</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                <input type="text" value="4242 4242 4242 4242" readOnly className="w-full bg-background border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">Expiry Date</label>
                <input type="text" value="12/26" readOnly className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">CVC</label>
                <input type="text" value="***" readOnly className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm font-mono focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground/60 mb-2">Name on Card</label>
              <input type="text" value="Test User" readOnly className="w-full bg-background border border-border/50 rounded-xl py-3 px-4 text-sm focus:outline-none" />
            </div>
          </div>

          <button 
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-70"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Simulate Payment — ₹299
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
