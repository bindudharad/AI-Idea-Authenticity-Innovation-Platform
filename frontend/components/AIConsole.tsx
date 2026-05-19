"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const defaultMessages = [
  "Initializing AI Agents",
  "Scanning patents",
  "Searching technologies",
  "Computing similarity",
  "Generating innovation score",
];

export function AIConsole({ messages = defaultMessages }: { messages?: string[] }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleCount((count) => (count < messages.length ? count + 1 : count));
    }, 700);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/40 p-5 font-mono text-sm text-slate-200">
      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">AI Console</div>
      <div className="space-y-2">
        {messages.slice(0, visibleCount).map((message) => (
          <motion.div
            key={message}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
          >
            {message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
