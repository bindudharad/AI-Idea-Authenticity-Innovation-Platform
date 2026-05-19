import Link from "next/link";

import { Card } from "@/ui/card";

export function EmptyAnalysisState({ title }: { title: string }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">No analysis loaded</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
        Run a fresh idea analysis first. These intelligence modules are powered by the latest analysis payload from
        the AI platform.
      </p>
      <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
        Go to Analyze
      </Link>
    </Card>
  );
}
