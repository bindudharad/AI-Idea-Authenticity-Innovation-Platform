import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog, notifyTeamMembers } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { isTeamLeader } from "@/lib/team-access";

export const runtime = "nodejs";

type Params = { params: Promise<{ teamId: string; memberId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, memberId } = await params;
    const leader = await isTeamLeader(teamId, userId);
    if (!leader) {
      return NextResponse.json({ error: "Only the team leader can manage members." }, { status: 403 });
    }

    const member = await db.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.teamId !== teamId) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    if (member.role === "leader") {
      return NextResponse.json({ error: "The team leader cannot be removed." }, { status: 400 });
    }

    await db.teamMember.delete({
      where: { id: memberId },
    });

    await createActivityLog({
      userId,
      action: "member_removed",
      detail: "Removed a member from the team.",
      teamId,
    });
    await notifyTeamMembers(teamId, userId, "A team member was removed by the leader.", {
      type: "member_removed",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to remove team member." },
      { status: 500 },
    );
  }
}
