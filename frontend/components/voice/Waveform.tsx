"use client";

import clsx from "clsx";

type WaveformProps = {
  active: boolean;
  speaking?: boolean;
  bars?: number[];
};

export function Waveform({ active, speaking = false, bars = [0.32, 0.58, 0.88, 0.46, 0.7, 0.4, 0.8] }: WaveformProps) {
  return (
    <div
      className={clsx(
        "flex h-16 items-end justify-center gap-1 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl transition-all duration-300",
        active ? "shadow-[0_0_36px_rgba(34,211,238,0.14)]" : "opacity-80",
      )}
    >
      {bars.map((bar, index) => (
        <span
          key={`${index}-${bar}`}
          className={clsx(
            "voice-wave-bar block w-1.5 rounded-full bg-gradient-to-t from-cyan-500 via-blue-400 to-purple-400",
            active ? "opacity-100" : "opacity-50",
            speaking ? "shadow-[0_0_14px_rgba(168,85,247,0.36)]" : "shadow-[0_0_14px_rgba(34,211,238,0.24)]",
          )}
          style={{
            height: `${Math.max(18, Math.round(bar * 44))}px`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
