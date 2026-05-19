import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog, notifyTeamMembers } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { getOrCreateIdeaAnalysis } from "@/lib/idea-analysis-cache";
import { serializeIdea } from "@/lib/prisma-serializers";
import { getTeamMembership } from "@/lib/team-access";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ideas = await db.idea.findMany({
      where: {
        OR: [
          { userId },
          {
            team: {
              members: {
                some: {
                  userId,
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        analysisResults: {
          orderBy: { createdAt: "asc" },
        },
        team: true,
      },
    });

    return NextResponse.json(ideas.map((idea) => serializeIdea(idea)));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load ideas." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      idea_name?: string;
      description?: string;
      mode?: string;
      idea_type?: string;
      is_public?: boolean;
      team_id?: string | null;
    };

    const ideaName = body.idea_name?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const ideaType = body.idea_type === "business" ? "business" : "startup";
    const mode = body.mode === "business" ? "business" : "hackathon";
    const teamId = body.team_id?.trim() || null;

    if (ideaName.length < 3 || description.length < 12) {
      return NextResponse.json({ error: "idea_name and description are required." }, { status: 400 });
    }

    if (teamId) {
      const membership = await getTeamMembership(teamId, userId);
      if (!membership) {
        return NextResponse.json({ error: "You are not a member of this team." }, { status: 403 });
      }
    }

    const { idea, result, cached } = await getOrCreateIdeaAnalysis({
      ideaName,
      ideaDescription: description,
      ideaType,
      userId,
      teamId,
      isPublic: Boolean(body.is_public),
      mode,
    });

    const savedIdea =
      idea ??
      (await db.idea.findFirst({
        where: {
          title: ideaName,
          description,
          ...(teamId ? { teamId } : { userId }),
        },
        include: {
          analysisResults: {
            orderBy: { createdAt: "asc" },
          },
          team: true,
        },
      }));

    if (!savedIdea) {
      return NextResponse.json({ error: "Unable to save idea." }, { status: 500 });
    }

    await createActivityLog({
      userId,
      action: cached ? "analysis_cached" : "analysis_created",
      detail: `Saved idea workspace ${savedIdea.title}.`,
      teamId: savedIdea.teamId ?? null,
      ideaId: savedIdea.id,
    });

    if (savedIdea.teamId) {
      await notifyTeamMembers(savedIdea.teamId, userId, `A shared idea workspace was updated: ${savedIdea.title}.`, {
        type: "idea_shared",
        ideaId: savedIdea.id,
      });
    }

    return NextResponse.json(serializeIdea(savedIdea, { includeResult: true }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save idea." },
      { status: 500 },
    );
  }
}
