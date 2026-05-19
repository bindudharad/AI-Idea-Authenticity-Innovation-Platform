import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { serializeIdea } from "@/lib/prisma-serializers";
import { canAccessIdea, isTeamLeader } from "@/lib/team-access";
import { db } from "@/lib/db";

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
    if (!Number.isFinite(ideaId)) {
      return NextResponse.json({ error: "Invalid idea id." }, { status: 400 });
    }

    const idea = await canAccessIdea(userId, ideaId);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    return NextResponse.json(serializeIdea(idea, { includeResult: true }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load idea." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = Number(id);
    const body = (await request.json()) as {
      description?: string;
      is_public?: boolean;
    };

    const existing = await canAccessIdea(userId, ideaId);

    if (!existing) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    const canEdit = existing.userId === userId || (existing.teamId ? await isTeamLeader(existing.teamId, userId) : false);
    if (!canEdit) {
      return NextResponse.json({ error: "Only the idea owner or team leader can modify this idea." }, { status: 403 });
    }

    const updated = await db.idea.update({
      where: { id: ideaId },
      data: {
        description: body.description?.trim() || existing.description,
        isPublic: typeof body.is_public === "boolean" ? body.is_public : existing.isPublic,
      },
      include: {
        analysisResults: {
          orderBy: { createdAt: "asc" },
        },
        team: true,
      },
    });

    return NextResponse.json(serializeIdea(updated, { includeResult: true }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update idea." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = Number(id);
    const existing = await canAccessIdea(userId, ideaId);

    if (!existing) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    const canDelete = existing.userId === userId || (existing.teamId ? await isTeamLeader(existing.teamId, userId) : false);
    if (!canDelete) {
      return NextResponse.json({ error: "Only the idea owner or team leader can delete this idea." }, { status: 403 });
    }

    await db.idea.delete({
      where: { id: ideaId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete idea." },
      { status: 500 },
    );
  }
}
