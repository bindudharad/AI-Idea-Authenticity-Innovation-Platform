"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Cpu, Database, Search, Terminal, Check } from "lucide-react";

const consoleMessages = [
  { icon: Terminal, text: "Initializing AI engine...", delay: 0 },
  { icon: Cpu, text: "Loading modules...", delay: 400 },
  { icon: Database, text: "Connecting to database...", delay: 800 },
  { icon: Search, text: "Activating similarity engine...", delay: 1200 },
  { icon: Sparkles, text: "Preparing analysis interface...", delay: 1600 },
  { icon: Check, text: "System ready.", delay: 2000 },
];

export function StartupAnimation() {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);

  useEffect(() => {
    consoleMessages.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, index]);
      }, msg.delay);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030711]"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-900/20 via-[#030711] to-[#030711]" />

      {/* Glowing orb container */}
      <div className="relative flex flex-col items-center">
        {/* Outer glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-full bg-sky-500/20 blur-3xl animate-pulse" />
        </div>

        {/* Inner pulsing circle */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative h-32 w-32 rounded-full bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500"
        >
          <div className="absolute inset-1 rounded-full bg-[#030711]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-sky-400" />
          </div>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 text-center text-xl font-semibold tracking-wide text-white sm:text-2xl"
        >
          INITIALIZING AI INNOVATION ENGINE
        </motion.h1>

        {/* Subtitle with typing dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 flex items-center gap-1 text-slate-400"
        >
          <span className="text-sm">Loading system</span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          >
            .
          </motion.span>
        </motion.div>
      </div>

      {/* Console messages panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-12 w-full max-w-md rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-sm"
      >
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-slate-500">system.log</span>
        </div>

        <div className="space-y-3">
          {consoleMessages.map((msg, index) => {
            const Icon = msg.icon;
            return (
              <AnimatePresence key={index}>
                {visibleMessages.includes(index) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <Icon className="h-4 w-4 text-sky-400" />
                    <span className="text-sm text-slate-300">{msg.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 w-full max-w-md"
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
