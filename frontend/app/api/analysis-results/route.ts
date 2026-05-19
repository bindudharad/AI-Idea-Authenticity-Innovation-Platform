import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeAnalysisResult } from "@/lib/prisma-serializers";
import { canAccessIdea } from "@/lib/team-access";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      idea_id?: number;
      innovation_score?: number;
      similarity_score?: number;
      technology_readiness?: number;
      market_potential?: number;
      ai_summary?: string;
      problem_statement?: string;
      proposed_solution?: string;
      innovation_highlights?: string[];
    };

    const ideaId = Number(body.idea_id);
    if (!Number.isFinite(ideaId)) {
      return NextResponse.json({ error: "Valid idea_id is required." }, { status: 400 });
    }

    const idea = await canAccessIdea(userId, ideaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    const record = await db.analysisResult.create({
      data: {
        ideaId,
        innovationScore: Number(body.innovation_score ?? 0),
        similarityScore: Number(body.similarity_score ?? 0),
        technologyReadiness: Number(body.technology_readiness ?? 0),
        marketPotential: Number(body.market_potential ?? 0),
        aiSummary: body.ai_summary ?? null,
        problemStatement: body.problem_statement ?? null,
        proposedSolution: body.proposed_solution ?? null,
        innovationHighlights: body.innovation_highlights ?? [],
      },
    });

    return NextResponse.json(serializeAnalysisResult(record), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create analysis result." },
      { status: 500 },
    );
  }
}
