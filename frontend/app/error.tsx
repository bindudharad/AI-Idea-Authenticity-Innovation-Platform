"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("🔥 GLOBAL ERROR:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-red-400/20 bg-red-500/5 p-8 text-red-100 shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">System error</p>
        <h1 className="mt-4 text-3xl font-black text-white">Something broke</h1>
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-red-200">
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
