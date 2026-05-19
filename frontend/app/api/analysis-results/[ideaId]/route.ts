import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { canAccessIdea } from "@/lib/team-access";
import { serializeAnalysisResult } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

type Params = { params: Promise<{ ideaId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ideaId } = await params;
    const parsedIdeaId = Number(ideaId);

    const idea = await canAccessIdea(userId, parsedIdeaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    return NextResponse.json(idea.analysisResults.map(serializeAnalysisResult));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load analysis results." },
      { status: 500 },
    );
  }
}
