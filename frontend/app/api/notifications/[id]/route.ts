import { NextRequest, NextResponse } from "next/server";

import { getUserIdFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { serializeNotification } from "@/lib/prisma-serializers";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { read?: boolean };

    const existing = await db.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    const notification = await db.notification.update({
      where: { id },
      data: {
        read: typeof body.read === "boolean" ? body.read : true,
      },
    });

    return NextResponse.json(serializeNotification(notification));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update notification." },
      { status: 500 },
    );
  }
}
