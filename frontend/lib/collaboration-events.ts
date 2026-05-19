import { db } from "@/lib/db";
import { emitTeamEvent, emitUserEvent } from "@/lib/realtime";

type NotificationInput = {
  userId: string;
  text: string;
  type?: string;
  teamId?: string | null;
  ideaId?: number | null;
};

type ActivityInput = {
  userId: string;
  action: string;
  detail: string;
  teamId?: string | null;
  ideaId?: number | null;
};

export async function createNotification(input: NotificationInput) {
  const notification = await db.notification.create({
    data: {
      userId: input.userId,
      text: input.text,
      type: input.type ?? "info",
      teamId: input.teamId ?? null,
      ideaId: input.ideaId ?? null,
    },
  });

  emitUserEvent(input.userId, "notification:new", {
    notificationId: notification.id,
    text: notification.text,
    type: notification.type,
    teamId: notification.teamId,
    ideaId: notification.ideaId,
    createdAt: notification.createdAt.toISOString(),
  });

  return notification;
}

export async function createActivityLog(input: ActivityInput) {
  const activity = await db.activityLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      detail: input.detail,
      teamId: input.teamId ?? null,
      ideaId: input.ideaId ?? null,
    },
  });

  if (activity.teamId) {
    emitTeamEvent(activity.teamId, "activity:new", {
      activityId: activity.id,
      userId: activity.userId,
      action: activity.action,
      detail: activity.detail,
      ideaId: activity.ideaId,
      createdAt: activity.createdAt.toISOString(),
    });
  }

  return activity;
}

export async function notifyTeamMembers(teamId: string, actorUserId: string, text: string, options?: { type?: string; ideaId?: number | null }) {
  const members = await db.teamMember.findMany({
    where: { teamId },
    select: { userId: true },
  });

  const recipients = members.filter((member) => member.userId !== actorUserId);
  if (recipients.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: recipients.map((member) => ({
      userId: member.userId,
      text,
      type: options?.type ?? "info",
      teamId,
      ideaId: options?.ideaId ?? null,
    })),
  });

  recipients.forEach((member) => {
    emitUserEvent(member.userId, "notification:new", {
      text,
      type: options?.type ?? "info",
      teamId,
      ideaId: options?.ideaId ?? null,
    });
  });
}
