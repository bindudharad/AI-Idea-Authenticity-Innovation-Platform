import { NextRequest, NextResponse } from "next/server";
import { customAlphabet } from "nanoid";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { serializeTeam } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

const createTeamCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim() ?? "";
    if (name.length < 2) {
      return NextResponse.json({ error: "Team name must be at least 2 characters." }, { status: 400 });
    }

    let team = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = createTeamCode();
      try {
        team = await db.team.create({
          data: {
            name,
            code,
            leaderId: userId,
            members: {
              create: {
                userId,
                role: "leader",
              },
            },
          },
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
        break;
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("Unique constraint")) {
          throw error;
        }
      }
    }

    if (!team) {
      return NextResponse.json({ error: "Unable to generate a unique team code. Please retry." }, { status: 500 });
    }

    await createActivityLog({
      userId,
      action: "team_created",
      detail: `Created team ${team.name}.`,
      teamId: team.id,
    });

    return NextResponse.json({ success: true, team: serializeTeam(team, userId) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create team." },
      { status: 500 },
    );
  }
}
