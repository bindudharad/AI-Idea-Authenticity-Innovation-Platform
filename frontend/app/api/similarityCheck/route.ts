import { NextRequest, NextResponse } from "next/server";

import { runSimilarityCheck } from "@/engines/similarityEngine";
import { enforceRateLimit } from "@/lib/requestGuard";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`similarityCheck:${requester}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const payload = (await request.json()) as {
    ideaText?: string;
    candidates?: Array<{ id?: string; title?: string; text?: string; source?: string; url?: string }>;
  };

  const ideaText = String(payload.ideaText ?? "").trim();
  const candidates = Array.isArray(payload.candidates)
    ? payload.candidates.map((candidate, index) => ({
        id: String(candidate.id ?? index),
        title: String(candidate.title ?? "Reference"),
        text: String(candidate.text ?? ""),
        source: String(candidate.source ?? "Unknown"),
        url: candidate.url ? String(candidate.url) : undefined,
      }))
    : [];

  if (!ideaText || candidates.length === 0) {
    return NextResponse.json({ error: "ideaText and candidates are required" }, { status: 400 });
  }

  return NextResponse.json(await runSimilarityCheck(ideaText, candidates));
}
