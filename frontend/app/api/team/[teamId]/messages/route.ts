import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { createActivityLog, notifyTeamMembers } from "@/lib/collaboration-events";
import { db } from "@/lib/db";
import { serializeMessage } from "@/lib/prisma-serializers";
import { emitTeamEvent } from "@/lib/realtime";
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

    const messages = await db.message.findMany({
      where: { teamId },
      include: {
        user: true,
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json(messages.map(serializeMessage));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load messages." },
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
    const membership = await requireTeamMembership(teamId, userId);

    const body = (await request.json()) as { content?: string };
    const content = body.content?.trim() ?? "";
    if (content.length < 1) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        content,
        userId,
        teamId,
      },
      include: {
        user: true,
      },
    });

    const serialized = serializeMessage(message);

    await createActivityLog({
      userId,
      action: "message_sent",
      detail: `Sent a message in ${membership.team.name}.`,
      teamId,
    });
    await notifyTeamMembers(teamId, userId, "A new team message was posted.", {
      type: "team_message",
    });

    emitTeamEvent(teamId, "message:new", {
      message: serialized,
    });

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send message." },
      { status: 500 },
    );
  }
}
