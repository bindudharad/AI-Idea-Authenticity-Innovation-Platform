import { NextRequest, NextResponse } from "next/server";

import { generateEmbeddings } from "@/lib/huggingfaceClient";
import { enforceRateLimit } from "@/lib/requestGuard";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`generateEmbeddings:${requester}`, 10, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  const payload = (await request.json()) as { texts?: string[] };
  const texts = Array.isArray(payload.texts) ? payload.texts.map((text) => String(text)) : [];
  if (texts.length === 0) {
    return NextResponse.json({ error: "texts are required" }, { status: 400 });
  }

  return NextResponse.json({ embeddings: await generateEmbeddings(texts) });
}
