import { NextRequest, NextResponse } from "next/server";

import { requestGroqJson } from "@/lib/groqClient";
import { IdeaCoachResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      ideaName?: string;
      ideaDescription?: string;
      innovationScore?: number;
      competitionLevel?: string;
    };

    const fallback: IdeaCoachResponse = {
      enhancedIdeaVersion:
        "Add a proprietary workflow layer, tighter customer segment focus, and measurable automation outcomes to make the concept stand out faster.",
      futureVersion:
        "Evolve the idea into a predictive platform with adaptive intelligence, real-time orchestration, and partner integrations.",
      startupScalableVersion:
        "Package the product as a repeatable B2B SaaS offering with compliance-ready data pipelines, analytics, and tiered team collaboration.",
      provider: "fallback",
    };

    const generated = await requestGroqJson<IdeaCoachResponse>(
      `Act as an AI startup coach. Suggest three upgraded versions of this startup idea.

Idea name: ${body.ideaName ?? "Unknown idea"}
Idea description: ${body.ideaDescription ?? ""}
Current innovation score: ${body.innovationScore ?? 0}
Competition level: ${body.competitionLevel ?? "moderate"}

Return strict JSON with keys:
- enhancedIdeaVersion
- futureVersion
- startupScalableVersion
- provider`,
      fallback,
      'Return strict JSON only. "provider" must be "groq".',
    );

    return NextResponse.json({
      ...generated,
      provider: generated.provider ?? "groq",
    });
  } catch {
    return NextResponse.json(
      {
        enhancedIdeaVersion:
          "Refine the first use case into a sharper wedge and build a proprietary signal loop around customer usage.",
        futureVersion:
          "Expand into an adaptive intelligence layer that predicts next-best actions and ecosystem shifts.",
        startupScalableVersion:
          "Turn the concept into a team platform with recurring subscriptions, analytics dashboards, and enterprise integrations.",
        provider: "fallback",
      } satisfies IdeaCoachResponse,
      { status: 200 },
    );
  }
}
