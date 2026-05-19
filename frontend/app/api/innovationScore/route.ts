import { NextRequest, NextResponse } from "next/server";

import { calculateInnovationScore } from "@/engines/innovationEngine";
import { enforceRateLimit } from "@/lib/requestGuard";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`innovationScore:${requester}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const payload = (await request.json()) as {
    similarityScore?: number;
    technologies?: string[];
    competitionCount?: number;
  };

  return NextResponse.json(
    calculateInnovationScore({
      similarityScore: Number(payload.similarityScore ?? 0),
      technologies: Array.isArray(payload.technologies) ? payload.technologies.map(String) : [],
      competitionCount: Number(payload.competitionCount ?? 0),
    }),
  );
}
