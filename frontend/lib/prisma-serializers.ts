import type { ActivityLog, AnalysisResult, Idea, Message, Notification, Team, TeamMember, User } from "@prisma/client";

import type {
  ActivityLogResponse,
  AnalyzeIdeaResponse,
  AnalysisResultResponse,
  IdeaResponse,
  IdeaVersionResponse,
  NotificationResponse,
  TeamMemberResponse,
  TeamMessageResponse,
  TeamSummaryResponse,
} from "@/types/api";
import type { UserProfile } from "@/types/auth";
import type { PlatformMode } from "@/types/idea";

type IdeaWithRelations = Idea & {
  analysisResults?: AnalysisResult[];
  team?: Team | null;
};

type TeamMemberWithUser = TeamMember & {
  user: User;
};

type TeamWithRelations = Team & {
  members?: TeamMemberWithUser[];
  ideas?: (Idea & { analysisResults?: AnalysisResult[]; team?: Team | null })[];
};

export function serializeUser(user: Pick<User, "id" | "fullName" | "email" | "createdAt">): UserProfile {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    created_at: user.createdAt.toISOString(),
  };
}

export function serializeIdeaVersion(result: AnalysisResult, index: number): IdeaVersionResponse {
  return {
    id: result.id,
    version_number: index + 1,
    description: result.proposedSolution ?? result.problemStatement ?? "Saved AI analysis version",
    innovation_score: result.innovationScore,
    created_at: result.createdAt.toISOString(),
  };
}

export function serializeAnalysisResult(result: AnalysisResult): AnalysisResultResponse {
  return {
    id: result.id,
    idea_id: result.ideaId,
    innovation_score: result.innovationScore,
    similarity_score: result.similarityScore,
    technology_readiness: result.technologyReadiness,
    market_potential: result.marketPotential,
    ai_summary: result.aiSummary,
    problem_statement: result.problemStatement,
    proposed_solution: result.proposedSolution,
    innovation_highlights: Array.isArray(result.innovationHighlights) ? (result.innovationHighlights as string[]) : [],
    created_at: result.createdAt.toISOString(),
  };
}

export function serializeIdea(idea: IdeaWithRelations, options?: { includeResult?: boolean }): IdeaResponse & { result?: AnalyzeIdeaResponse | null } {
  const orderedResults = [...(idea.analysisResults ?? [])].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    mode: idea.mode as PlatformMode,
    is_public: idea.isPublic,
    innovation_score: idea.innovationScore,
    latest_similarity_score: idea.latestSimilarityScore,
    team_id: idea.teamId,
    team: idea.team
      ? {
          id: idea.team.id,
          name: idea.team.name,
          code: idea.team.code,
          leader_id: idea.team.leaderId,
          role: "member",
          created_at: idea.team.createdAt.toISOString(),
          member_count: 0,
          members: [],
          ideas: [],
        }
      : null,
    created_at: idea.createdAt.toISOString(),
    updated_at: idea.updatedAt.toISOString(),
    versions: orderedResults.map(serializeIdeaVersion),
    ...(options?.includeResult ? { result: (idea.result as AnalyzeIdeaResponse) ?? null } : {}),
  };
}

export function serializeTeamMember(member: TeamMemberWithUser): TeamMemberResponse {
  return {
    id: member.id,
    user_id: member.userId,
    full_name: member.user.fullName,
    email: member.user.email,
    role: member.role as "leader" | "member",
    created_at: member.createdAt.toISOString(),
  };
}

export function serializeTeam(team: TeamWithRelations, userId?: string): TeamSummaryResponse {
  const members = (team.members ?? []).map(serializeTeamMember);
  const currentMembership = members.find((member) => member.user_id === userId);

  return {
    id: team.id,
    name: team.name,
    code: team.code,
    leader_id: team.leaderId,
    role: currentMembership?.role ?? "member",
    created_at: team.createdAt.toISOString(),
    member_count: members.length,
    members,
    ideas: (team.ideas ?? []).map((idea) =>
      serializeIdea(
        {
          ...idea,
          team,
        },
        { includeResult: true },
      ),
    ),
  };
}

export function serializeMessage(
  message: Message & {
    user: User;
  },
): TeamMessageResponse {
  return {
    id: message.id,
    content: message.content,
    user_id: message.userId,
    full_name: message.user.fullName,
    created_at: message.createdAt.toISOString(),
  };
}

export function serializeNotification(notification: Notification): NotificationResponse {
  return {
    id: notification.id,
    text: notification.text,
    type: notification.type,
    read: notification.read,
    team_id: notification.teamId ?? null,
    idea_id: notification.ideaId ?? null,
    created_at: notification.createdAt.toISOString(),
  };
}

export function serializeActivityLog(
  activity: ActivityLog & {
    user: User;
  },
): ActivityLogResponse {
  return {
    id: activity.id,
    user_id: activity.userId,
    full_name: activity.user.fullName,
    action: activity.action,
    detail: activity.detail,
    created_at: activity.createdAt.toISOString(),
    team_id: activity.teamId ?? null,
    idea_id: activity.ideaId ?? null,
  };
}
