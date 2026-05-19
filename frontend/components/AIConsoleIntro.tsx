"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BOOT_LINES = [
  "Initializing TEAM_VORTEX AI Engine...",
  "Loading innovation intelligence modules...",
  "Connecting to knowledge databases...",
  "Activating AI similarity detection system...",
  "Preparing innovation analysis interface...",
  "System ready.",
];

const SESSION_KEY = "ai_console_intro_seen";
const MAX_DURATION = 1500; // Maximum 1.5 seconds regardless of animation

type AIConsoleIntroProps = {
  children: React.ReactNode;
};

export function AIConsoleIntro({ children }: AIConsoleIntroProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const hasCheckedRef = useRef(false);
  const maxDurationRef = useRef<number | null>(null);

  // Check if already seen
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const seen = window.sessionStorage.getItem(SESSION_KEY);
    if (seen) {
      setShowIntro(false);
      return;
    }

    // Safety timeout - force exit after MAX_DURATION
    maxDurationRef.current = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setShowIntro(false);
    }, MAX_DURATION);

    return () => {
      if (maxDurationRef.current) window.clearTimeout(maxDurationRef.current);
    };
  }, []);

  // Progress through boot lines quickly
  useEffect(() => {
    if (!showIntro || currentLine >= BOOT_LINES.length) return;

    const timer = window.setTimeout(() => {
      setCurrentLine((prev) => prev + 1);
    }, 200); // 200ms per line = ~1.2 seconds total

    return () => window.clearTimeout(timer);
  }, [showIntro, currentLine]);

  // Hide intro when all lines shown
  useEffect(() => {
    if (currentLine >= BOOT_LINES.length && showIntro) {
      const timer = window.setTimeout(() => {
        window.sessionStorage.setItem(SESSION_KEY, "true");
        setShowIntro(false);
      }, 200);
      return () => window.clearTimeout(timer);
    }
  }, [currentLine, showIntro]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (maxDurationRef.current) window.clearTimeout(maxDurationRef.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(2,6,23,0.95)]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="mx-4 w-full max-w-2xl rounded-2xl border border-emerald-400/30 bg-[rgba(5,12,24,0.95)] p-6 shadow-[0_0_35px_rgba(14,116,144,0.35)]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="ai-glow-symbol mb-4" />
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  TEAM_VORTEX AI Command Console
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-400/20 bg-black/60 p-4 font-mono text-sm text-emerald-200">
                <div className="space-y-1">
                  {BOOT_LINES.slice(0, currentLine).map((line, index) => (
                    <p key={index} className="text-emerald-200">
                      {line}
                    </p>
                  ))}
                  {currentLine < BOOT_LINES.length && (
                    <p className="text-emerald-200">
                      {BOOT_LINES[currentLine]}|
                    </p>
                  )}
                </div>
                <div className="mt-4 text-xs text-emerald-300/80">
                  AI Engine Status: <span className="text-emerald-200">Online</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      <AnimatePresence>
        {!showIntro ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <style jsx global>{`
        .ai-glow-symbol {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #00f0ff;
          box-shadow: 0 0 20px #00f0ff, 0 0 40px #00f0ff;
          animation: pulse-glow 1s infinite;
          position: relative;
        }
        
        .ai-glow-symbol::before {
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
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

