import { db } from "@/lib/db";

export async function getTeamMembership(teamId: string, userId: string) {
  return db.teamMember.findUnique({
    where: {
      userId_teamId: {
        userId,
        teamId,
      },
    },
    include: {
      team: true,
      user: true,
    },
  });
}

export async function requireTeamMembership(teamId: string, userId: string) {
  const membership = await getTeamMembership(teamId, userId);
  if (!membership) {
    throw new Error("You do not have access to this team.");
  }

  return membership;
}

export async function isTeamLeader(teamId: string, userId: string) {
  const membership = await getTeamMembership(teamId, userId);
  return membership?.role === "leader";
}

export async function canAccessIdea(userId: string, ideaId: number) {
  const idea = await db.idea.findFirst({
    where: {
      id: ideaId,
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
    include: {
      analysisResults: {
        orderBy: { createdAt: "asc" },
      },
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
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return idea;
}
