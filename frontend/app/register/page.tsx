"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { getCurrentUser, loginUser, registerUser } from "@/services/auth-service";
import { storeAuthSession } from "@/services/auth-session";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fullName.trim().length < 2) {
      setError("Enter your full name.");
      return;
    }
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
      await registerUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      const token = await loginUser(email.trim(), password);
      const user = await getCurrentUser(token.access_token);
      storeAuthSession(token.access_token, user);
      router.push("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title="Create Account"
      description="Register your founder workspace to save ideas, track versions, and unlock the full startup operating system."
    >
      <div className="mx-auto max-w-xl">
        <Card className="panel-hover">
          <p className="panel-heading">Founder onboarding</p>
          <h2 className="panel-subtitle">Create your workspace</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                autoComplete="name"
                className="w-full rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/50"
                placeholder="Aarav Mehta"
              />
            </label>

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
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-300 hover:text-cyan-200">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </PageShell>
  );
}
