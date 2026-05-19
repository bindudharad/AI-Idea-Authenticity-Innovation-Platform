"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "ai_initial_loading_seen";
const LOADING_DURATION = 800; // 800ms boot time
const SAFETY_TIMEOUT = 2000; // 2s safety limit

export function InitialLoading({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasCheckedRef.current) {
      return;
    }

    hasCheckedRef.current = true;
    const seen = window.sessionStorage.getItem(SESSION_KEY);
    
    if (seen) {
      setLoading(false);
      return;
    }

    // Main timer - hide loading after LOADING_DURATION
    const timer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(SESSION_KEY, "true");
      }
      setLoading(false);
    }, LOADING_DURATION);

    // Safety timeout - force hide after SAFETY_TIMEOUT
    const safetyTimer = window.setTimeout(() => {
      setLoading(false);
    }, SAFETY_TIMEOUT);

    // Aggressive fallback - force navigation if still stuck
    const forceNavigateTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      router.replace("/");
    }, 2500);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(safetyTimer);
      window.clearTimeout(forceNavigateTimer);
    };
  }, [router]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,#06142a,#020611)]">
          <div className="ai-glow-loader" />
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            Initializing AI Innovation Engine...
          </p>
          <style jsx>{`
            .ai-glow-loader {
              width: 60px;
              height: 60px;
              border-radius: 50%;
              border: 3px solid #00f0ff;
              box-shadow: 0 0 20px #00f0ff, 0 0 40px #00f0ff;
              animation: pulse-glow 1s infinite;
              position: relative;
            }
            .ai-glow-loader::before {
              content: "AI";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 18px;
              font-weight: bold;
              color: #00f0ff;
              text-shadow: 0 0 10px #00f0ff;
            }
            @keyframes pulse-glow {
              0%, 100% { transform: scale(0.9); opacity: 0.7; }
              50% { transform: scale(1.1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      <div className={loading ? "hidden" : "opacity-100 transition-opacity duration-500"}>
        {children}
      </div>
    </>
  );
}
