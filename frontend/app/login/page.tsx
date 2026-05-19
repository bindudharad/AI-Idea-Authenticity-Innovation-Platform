"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser, loginUser } from "@/services/auth-service";
import { storeAuthSession } from "@/services/auth-session";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await loginUser(email.trim(), password);
      const user = await getCurrentUser(token.access_token);
      storeAuthSession(token.access_token, user);
      router.push(searchParams?.get("next") || "/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Sign In"
      description="Access your saved startup ideas, backend intelligence modules, and collaboration workspace."
    >
      <div className="mx-auto max-w-xl">
        <Card className="panel-hover">
          <p className="panel-heading">Authentication</p>
          <h2 className="panel-subtitle">Sign in to your startup operating system</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                placeholder="founder@example.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                placeholder="Minimum 8 characters"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="min-w-[180px]">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            New here?{" "}
            <Link href="/register" className="text-cyan-300 hover:text-cyan-200">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageShell
          title="Sign In"
          description="Access your saved startup ideas, backend intelligence modules, and collaboration workspace."
        >
          <div className="mx-auto max-w-xl">
            <Card className="panel-hover p-6 text-sm text-slate-300">Loading sign in...</Card>
          </div>
        </PageShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
