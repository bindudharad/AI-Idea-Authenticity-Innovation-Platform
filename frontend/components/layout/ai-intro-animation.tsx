"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";

export default function AIIntroAnimation() {
  const [rotate, setRotate] = useState(true);

  useEffect(() => {
    const audio = new Audio("/sounds/boot.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});

    const timer = setTimeout(() => {
      setRotate(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-[260px] h-[260px] rounded-full border border-cyan-400 opacity-30" />
        <div className="absolute w-[300px] h-[300px] bg-cyan-500 blur-3xl opacity-20 rounded-full" />
        <div className="relative w-[200px] h-[200px] flex items-center justify-center rounded-full border border-cyan-400 shadow-[0_0_60px_#00f0ff]">
          <div className={rotate ? "spin-slow-3" : ""}>
            <Image
              src="/team/team_vortex_icon.png"
              alt="TEAM_VERTEX"
              width={150}
              height={150}
              className="object-contain scale-150 drop-shadow-[0_0_40px_#00f0ff] animate-pulse"
            />
          </div>
        </div>
        <div className="scan-line" />
      </div>

      <TypeAnimation
        sequence={[
          "Initializing AI Innovation Engine...",
          1000,
          "Connecting to intelligent systems...",
          1000,
          "Preparing innovation analysis...",
          1000,
          "System Ready.",
          2000,
        ]}
        wrapper="span"
        speed={50}
        repeat={Infinity}
        className="mt-6 text-cyan-400 text-sm tracking-widest text-glow"
      />
    </div>
  );
}
