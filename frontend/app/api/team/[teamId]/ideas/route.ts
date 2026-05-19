import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog, notifyTeamMembers } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { serializeIdea } from "@/lib/prisma-serializers";
import { requireTeamMembership } from "@/lib/team-access";

export const runtime = "nodejs";

type Params = { params: Promise<{ teamId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    await requireTeamMembership(teamId, userId);

    const ideas = await db.idea.findMany({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      include: {
        analysisResults: {
          orderBy: { createdAt: "asc" },
        },
        team: true,
      },
    });

    return NextResponse.json(ideas.map((idea) => serializeIdea(idea, { includeResult: true })));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load team ideas." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;
    await requireTeamMembership(teamId, userId);

    const body = (await request.json()) as { ideaId?: number };
    const ideaId = Number(body.ideaId);
    if (!Number.isFinite(ideaId)) {
      return NextResponse.json({ error: "Valid ideaId is required." }, { status: 400 });
    }

    const idea = await db.idea.findFirst({
      where: { id: ideaId, userId },
      include: {
        analysisResults: {
          orderBy: { createdAt: "asc" },
        },
        team: true,
      },
    });

    if (!idea) {
      return NextResponse.json({ error: "Only your saved ideas can be shared to a team." }, { status: 404 });
    }

    const updated = await db.idea.update({
      where: { id: ideaId },
      data: { teamId },
      include: {
        analysisResults: {
          orderBy: { createdAt: "asc" },
        },
        team: true,
      },
    });

    await createActivityLog({
      userId,
      action: "idea_shared",
      detail: `Shared idea ${updated.title} with the team workspace.`,
      teamId,
      ideaId: updated.id,
    });
    await notifyTeamMembers(teamId, userId, `A new shared idea was added: ${updated.title}.`, {
      type: "idea_shared",
      ideaId: updated.id,
    });

    return NextResponse.json(serializeIdea(updated, { includeResult: true }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to share idea with team." },
      { status: 500 },
    );
  }
}
