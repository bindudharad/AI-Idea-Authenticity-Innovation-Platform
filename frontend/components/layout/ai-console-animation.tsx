"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const lines = [
  "Initializing TEAM_VERTEX AI Engine...",
  "Connecting to knowledge databases...",
  "Activating AI similarity detection system...",
  "Preparing innovation analysis interface...",
  "System ready.",
  "AI Engine Status: Online",
];

export default function AIConsoleAnimation() {
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => [...prev, lines[i]]);
      i += 1;
      if (i >= lines.length) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 bg-black text-green-400 font-mono">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-30 rounded-full" />
        <Image
          src="/team/team_vortex_icon.png"
          alt="TEAM_VERTEX"
          width={80}
          height={80}
          className="relative object-contain scale-125 drop-shadow-[0_0_30px_#00f0ff]"
        />
      </div>

      <div className="bg-black border border-green-400 rounded-xl p-6 shadow-[0_0_40px_#00ff99] w-[600px]">
        <h2 className="text-center mb-4 text-green-300">
          TEAM_VERTEX AI COMMAND CONSOLE
        </h2>

        {displayed.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
