"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Optimize Page Crash:", error);
  }, [error]);

  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center pt-28 pb-20 px-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-2xl w-full">
        <h2 className="text-xl text-red-500 font-bold mb-4">React Rendering Crash Detected</h2>
        <pre className="text-xs text-left bg-background p-4 rounded-xl mb-6 overflow-auto max-w-full border border-border/40 text-red-400">
          {error.message}
          {"\n\n"}
          {error.stack}
        </pre>
        <button
          onClick={() => reset()}
          className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
