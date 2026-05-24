"use client";

import { useState } from "react";
import CanvasBg from "@/components/canvas-bg";
import Header from "@/components/header";
import { CheckCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTestPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/mock", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Payment simulation failed");
      }
      setSuccess(true);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <CanvasBg />
      <Header />
      <main className="relative z-10 flex-1 pt-32 pb-20 px-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-card/50 backdrop-blur-md border border-border/60 rounded-3xl p-10 shadow-premium">
          {!success ? (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black font-heading tracking-tight mb-2">Secure Checkout</h1>
                <p className="text-foreground/60 text-sm">Testing Payment Gateway</p>
              </div>

              <div className="bg-foreground/5 rounded-2xl p-6 mb-8 border border-border/50">
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-border/50">
                  <div>
                    <h3 className="font-bold text-foreground">30-Day Job Hunt OS</h3>
                    <p className="text-xs text-foreground/60 mt-1">Full premium suite access</p>
                  </div>
                  <div className="font-black font-mono">₹299</div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/60">Total</span>
                  <span className="font-black text-xl">₹299</span>
                </div>
              </div>

              <button
                onClick={handleTestPayment}
                disabled={loading}
                className="w-full bg-emerald-500 text-background font-bold tracking-widest uppercase text-sm py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now (Test Mode)"}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 relative">
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                <CheckCircle className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black font-heading tracking-tight mb-3">Payment Successful!</h1>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Welcome to the 30-Day Job Hunt OS. You now have full access to all premium tools.
              </p>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="bg-foreground text-background font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-xl hover:scale-[1.02] transition-transform"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
