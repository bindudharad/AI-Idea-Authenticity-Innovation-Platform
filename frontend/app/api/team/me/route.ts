import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeTeam } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db.teamMember.findMany({
      where: { userId },
      include: {
        team: {
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
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(memberships.map((membership) => serializeTeam(membership.team, userId)));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load teams." },
      { status: 500 },
    );
  }
}
