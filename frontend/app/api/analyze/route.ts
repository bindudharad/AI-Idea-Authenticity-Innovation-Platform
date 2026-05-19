import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { getOrCreateIdeaAnalysis } from "@/lib/idea-analysis-cache";
import { enforceRateLimit } from "@/lib/requestGuard";
import { cleanText } from "@/utils/textCleaner";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`analyze:${requester}`, 20, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please retry shortly." }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as {
      idea?: string;
      description?: string;
      ideaName?: string;
      ideaDescription?: string;
      idea_type?: string;
    };

    const ideaName = cleanText(payload.ideaName ?? payload.idea ?? "");
    const ideaDescription = cleanText(payload.ideaDescription ?? payload.description ?? "");
    const ideaType = payload.idea_type === "business" ? "business" : "startup";
    const userId = getUserIdFromRequest(request);

    if (ideaName.length < 3 || ideaDescription.length < 12) {
      return NextResponse.json({ error: "idea and description are required." }, { status: 400 });
    }
    const { result, cached } = await getOrCreateIdeaAnalysis({
      ideaName,
      ideaDescription,
      ideaType,
      userId,
    });

    return NextResponse.json({
      ...result,
      cached,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to analyze idea.",
      },
      { status: 500 },
    );
  }
}
