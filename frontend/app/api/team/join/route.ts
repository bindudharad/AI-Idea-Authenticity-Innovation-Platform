import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog, notifyTeamMembers } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { serializeTeam } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { code?: string };
    const code = body.code?.trim().toUpperCase() ?? "";
    if (code.length < 4) {
      return NextResponse.json({ error: "Valid team code is required." }, { status: 400 });
    }

    const team = await db.team.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "asc" },
        },
        ideas: {
          include: {
            analysisResults: {
              orderBy: { createdAt: "asc" },
            },
            team: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid team code." }, { status: 404 });
    }

    const existingMembership = team.members.find((member) => member.userId === userId);
    if (!existingMembership) {
      await db.teamMember.create({
        data: {
          userId,
          teamId: team.id,
          role: "member",
        },
      });

      await createActivityLog({
        userId,
        action: "team_joined",
        detail: `Joined team ${team.name}.`,
        teamId: team.id,
      });
      await notifyTeamMembers(team.id, userId, "A new member joined the team.", {
        type: "team_joined",
      });
    }

    const refreshed = await db.team.findUnique({
      where: { id: team.id },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "asc" },
        },
        ideas: {
          include: {
            analysisResults: {
              orderBy: { createdAt: "asc" },
            },
            team: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!refreshed) {
      return NextResponse.json({ error: "Team no longer exists." }, { status: 404 });
    }

    return NextResponse.json({ success: true, team: serializeTeam(refreshed, userId) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to join team." },
      { status: 500 },
    );
  }
}
