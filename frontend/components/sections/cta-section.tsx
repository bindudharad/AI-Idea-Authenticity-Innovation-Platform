import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export function CtaSection() {
  return (
    <section className="section-shell py-16">
      <Card className="bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-8 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-glow">Ready to validate</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Start with a single idea, leave with strategic clarity.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Explore similarity, innovation, startup potential, architecture, and proof of ownership from one guided workspace.
            </p>
          </div>
          <Button href="/analyze" className="min-w-52">
            Open Analysis Studio
          </Button>
        </div>
      </Card>
    </section>
  );
}
