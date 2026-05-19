"use client";

import Link from "next/link";

import { Card } from "@/ui/card";

export function AuthRequiredState({ title }: { title: string }) {
  return (
    <Card>
      <p className="panel-heading">Authentication required</p>
      <h2 className="panel-subtitle">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Sign in to access your saved ideas, backend intelligence modules, and team workspace.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/login" className="inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Sign in
        </Link>
        <Link href="/register" className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white">
          Create account
        </Link>
      </div>
    </Card>
  );
}

export function LoginRequiredCard({
  title = "Login Required",
  description = "To access this feature, please sign in or create an account.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="rounded-[24px] border-white/10 bg-white/[0.04]">
      <p className="panel-heading">Protected access</p>
      <h2 className="panel-subtitle">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/login" className="inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Login
        </Link>
        <Link href="/register" className="inline-flex rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white">
          Register
        </Link>
      </div>
    </Card>
  );
}

export function EmptyIdeaState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <p className="panel-heading">No saved idea selected</p>
      <h2 className="panel-subtitle">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
      <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
        Analyze a startup idea
      </Link>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-rose-400/20">
      <p className="panel-heading">Module error</p>
      <h2 className="panel-subtitle">We hit a backend loading issue</h2>
      <p className="mt-4 text-sm leading-7 text-slate-300">{message}</p>
    </Card>
  );
}
