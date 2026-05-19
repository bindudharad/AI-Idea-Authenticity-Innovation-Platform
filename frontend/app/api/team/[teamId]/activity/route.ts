import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeActivityLog } from "@/lib/prisma-serializers";
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

    const activity = await db.activityLog.findMany({
      where: { teamId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(activity.map(serializeActivityLog));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load activity." },
      { status: 500 },
    );
  }
}
