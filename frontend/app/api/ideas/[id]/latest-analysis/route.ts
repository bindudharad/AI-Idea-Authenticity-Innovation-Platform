import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { canAccessIdea } from "@/lib/team-access";
import { serializeAnalysisResult } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = Number(id);

    const idea = await canAccessIdea(userId, ideaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    const latest = [...idea.analysisResults].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return NextResponse.json(latest ? serializeAnalysisResult(latest) : null);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load latest analysis result." },
      { status: 500 },
    );
  }
}
