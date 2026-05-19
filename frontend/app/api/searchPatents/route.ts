import { NextRequest, NextResponse } from "next/server";

import { searchPatents } from "@/lib/patentClient";
import { enforceRateLimit } from "@/lib/requestGuard";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`searchPatents:${requester}`);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const payload = (await request.json()) as { keyword?: string };
  const keyword = String(payload.keyword ?? "").trim();
  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  return NextResponse.json({ results: await searchPatents(keyword) });
}
