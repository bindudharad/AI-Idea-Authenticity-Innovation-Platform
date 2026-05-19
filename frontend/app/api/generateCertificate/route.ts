import { NextRequest, NextResponse } from "next/server";

import { generateCertificate } from "@/engines/certificateEngine";
import { enforceRateLimit } from "@/lib/requestGuard";
import { GenerateCertificatePayload } from "@/types/api";
import { cleanText } from "@/utils/textCleaner";

export async function POST(request: NextRequest) {
  const requester = request.headers.get("x-forwarded-for") ?? "local";
  const rateLimit = enforceRateLimit(`generateCertificate:${requester}`, 12, 60_000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Please retry shortly." }, { status: 429 });
  }

  try {
    const payload = (await request.json()) as GenerateCertificatePayload;
    const ideaName = cleanText(payload.ideaName ?? "");
    const userId = String(payload.userId ?? "").trim();
    const uniquenessScore = Number(payload.uniquenessScore ?? 0);

    if (ideaName.length < 3 || userId.length < 3) {
      return NextResponse.json({ error: "ideaName and userId are required." }, { status: 400 });
    }

    if (uniquenessScore < 90) {
      return NextResponse.json(
        { error: "Certificate available only for ideas with uniqueness score above 90%." },
        { status: 400 },
      );
    }

    return NextResponse.json(generateCertificate(ideaName, uniquenessScore, userId));
  } catch {
    return NextResponse.json({ error: "Unable to generate certificate." }, { status: 500 });
  }
}
