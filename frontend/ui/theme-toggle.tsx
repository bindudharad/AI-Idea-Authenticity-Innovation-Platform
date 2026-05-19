"use client";

import { MoonStar } from "lucide-react";

export function ThemeToggle() {
  return (
    <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10">
      <MoonStar className="h-4 w-4" />
    </button>
  );
}
