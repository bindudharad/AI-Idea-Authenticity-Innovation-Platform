"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Copy, Loader2, MessageSquare, Shield, Sparkles, Users } from "lucide-react";

import { LoginRequiredCard } from "@/components/shared/module-state";
import { getDemoAccessToken } from "@/services/demo-session";
import { clearCurrentTeam, readCurrentTeam, storeCurrentTeam } from "@/services/current-team";
import { readAuthUser } from "@/services/auth-session";
import {
  createTeam,
  getMyTeams,
  getTeamActivity,
  getTeamMessages,
  joinTeam,
  removeTeamMember,
  sendTeamMessage,
  shareIdeaWithTeam,
} from "@/services/idea-service";
import { getSocketClient } from "@/services/socket-client";
import { useAppStore } from "@/store/useAppStore";
import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import type { ActivityLogResponse, IdeaResponse, TeamMessageResponse, TeamSummaryResponse } from "@/types/api";

type TeamWorkspaceProps = {
  idea: IdeaResponse | null;
};

export function TeamWorkspace({ idea }: TeamWorkspaceProps) {
  const [teams, setTeams] = useState<TeamSummaryResponse[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(readCurrentTeam()?.id ?? null);
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [messages, setMessages] = useState<TeamMessageResponse[]>([]);
  const [activity, setActivity] = useState<ActivityLogResponse[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const setCurrentTeam = useAppStore((state) => state.setTeam);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? teams[0] ?? null,
    [teams, selectedTeamId],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setAuthRequired(false);

    void (async () => {
      try {
        const token = await getDemoAccessToken();
        if (!token) {
          if (active) {
            setAuthRequired(true);
            setTeams([]);
          }
          return;
        }

        const response = await getMyTeams(token);
        if (!active) {
          return;
        }

        setTeams(response);
        const persistedTeam = readCurrentTeam();
        const nextSelected =
          response.find((team) => team.id === persistedTeam?.id)?.id ??
          response.find((team) => team.id === selectedTeamId)?.id ??
          response[0]?.id ??
          null;
        setSelectedTeamId(nextSelected);

        const selected = response.find((team) => team.id === nextSelected);
        if (selected) {
          storeCurrentTeam(selected);
          setCurrentTeam(selected);
        } else {
          clearCurrentTeam();
          setCurrentTeam(null);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load team collaboration data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedTeamId, setCurrentTeam]);

  useEffect(() => {
    if (selectedTeam) {
      storeCurrentTeam(selectedTeam);
      setCurrentTeam(selectedTeam);
    } else {
      clearCurrentTeam();
      setCurrentTeam(null);
    }
  }, [selectedTeam, setCurrentTeam]);

  useEffect(() => {
    let active = true;
    if (!selectedTeam) {
      setMessages([]);
      setActivity([]);
      return;
    }

    void (async () => {
      try {
        const token = await getDemoAccessToken();
        if (!token) {
          return;
        }

        const [nextMessages, nextActivity] = await Promise.all([
          getTeamMessages(selectedTeam.id, token),
          getTeamActivity(selectedTeam.id, token),
        ]);

        if (!active) {
          return;
        }

        setMessages(nextMessages);
        setActivity(nextActivity);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load team feed.");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedTeam]);

  useEffect(() => {
    const socket = getSocketClient();
    if (!socket || !selectedTeam) {
      return;
    }

    socket.emit("team:join", selectedTeam.id);

    const handleMessage = (payload: { message?: TeamMessageResponse }) => {
      const incomingMessage = payload.message;
      if (!incomingMessage) {
        return;
      }

      setMessages((current) =>
        current.some((item) => item.id === incomingMessage.id) ? current : [...current, incomingMessage],
      );
    };

    const handleActivity = (payload: {
      activityId?: string;
      userId?: string;
      fullName?: string;
      action?: string;
      detail?: string;
      ideaId?: number | null;
      createdAt?: string;
    }) => {
      if (!payload.activityId || !payload.action || !payload.detail || !payload.createdAt) {
        return;
      }

      const incomingActivity: ActivityLogResponse = {
        id: payload.activityId,
        user_id: payload.userId ?? "unknown",
        full_name: payload.fullName ?? "Teammate",
        action: payload.action,
        detail: payload.detail,
        idea_id: payload.ideaId ?? null,
        team_id: selectedTeam.id,
        created_at: payload.createdAt,
      };

      setActivity((current) => {
        if (current.some((item) => item.id === payload.activityId)) {
          return current;
        }

        return [incomingActivity, ...current].slice(0, 50);
      });
    };

    socket.on("message:new", handleMessage);
    socket.on("activity:new", handleActivity);

    return () => {
      socket.emit("team:leave", selectedTeam.id);
      socket.off("message:new", handleMessage);
      socket.off("activity:new", handleActivity);
    };
  }, [selectedTeam]);

  async function handleCreateTeam() {
    if (createName.trim().length < 2) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setAuthRequired(true);
        return;
      }

      const response = await createTeam(createName.trim(), token);
      const nextTeams = [response.team, ...teams.filter((team) => team.id !== response.team.id)];
      setTeams(nextTeams);
      setSelectedTeamId(response.team.id);
      storeCurrentTeam(response.team);
      setCurrentTeam(response.team);
      setCreateName("");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create team.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleJoinTeam() {
    if (joinCode.trim().length < 4) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setAuthRequired(true);
        return;
      }

      const response = await joinTeam(joinCode.trim(), token);
      const nextTeams = [response.team, ...teams.filter((team) => team.id !== response.team.id)];
      setTeams(nextTeams);
      setSelectedTeamId(response.team.id);
      storeCurrentTeam(response.team);
      setCurrentTeam(response.team);
      setJoinCode("");
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Unable to join team.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShareIdea() {
    if (!idea || !selectedTeam) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setAuthRequired(true);
        return;
      }

      await shareIdeaWithTeam(selectedTeam.id, idea.id, token);
      const response = await getMyTeams(token);
      setTeams(response);
      const refreshedTeam = response.find((team) => team.id === selectedTeam.id) ?? selectedTeam;
      setSelectedTeamId(refreshedTeam.id);
      storeCurrentTeam(refreshedTeam);
      setCurrentTeam(refreshedTeam);
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Unable to share idea with this team.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!selectedTeam) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setAuthRequired(true);
        return;
      }

      await removeTeamMember(selectedTeam.id, memberId, token);
      const response = await getMyTeams(token);
      setTeams(response);
      const refreshedTeam = response.find((team) => team.id === selectedTeam.id) ?? null;
      setSelectedTeamId(refreshedTeam?.id ?? response[0]?.id ?? null);
      if (refreshedTeam) {
        storeCurrentTeam(refreshedTeam);
        setCurrentTeam(refreshedTeam);
      }
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove this team member.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyCode() {
    if (!selectedTeam?.code || typeof navigator === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedTeam.code);
    } catch {
      setError("Unable to copy the invite code from this browser session.");
    }
  }

  async function handleSendMessage() {
    if (!selectedTeam || messageDraft.trim().length < 1) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const token = await getDemoAccessToken();
      if (!token) {
        setAuthRequired(true);
        return;
      }

      const message = await sendTeamMessage(selectedTeam.id, messageDraft.trim(), token);
      setMessages((current) => (current.some((item) => item.id === message.id) ? current : [...current, message]));
      setMessageDraft("");
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Unable to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authRequired) {
    return (
      <Card>
        <LoginRequiredCard
          title="Login Required"
          description="Sign in to create teams, join with an invite code, and share idea workspaces."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Create team</p>
              </div>
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Team Vortex Alpha"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              />
              <Button className="mt-4" onClick={() => void handleCreateTeam()} disabled={submitting || createName.trim().length < 2}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Create Team
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-sky-300" />
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Join with code</p>
              </div>
              <input
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-sm uppercase tracking-[0.18em] text-white outline-none transition focus:border-sky-300/40"
              />
              <Button variant="secondary" className="mt-4" onClick={() => void handleJoinTeam()} disabled={submitting || joinCode.trim().length < 4}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                Join Team
              </Button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Your teams</p>
              {loading ? (
                <LoadingRow label="Loading teams..." />
              ) : teams.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        selectedTeamId === team.id
                          ? "border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                          : "border-white/10 bg-black/15 hover:border-white/20 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{team.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                            {team.member_count} members · {team.role}
                          </p>
                        </div>
                        {team.role === "leader" ? (
                          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
                            Leader
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyMessage message="Create a team or join one with an invite code to start collaborating." />
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Active team</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedTeam?.name ?? "No team selected"}</h3>
                </div>
                {selectedTeam ? (
                  <Button variant="secondary" onClick={() => void handleCopyCode()}>
                    <Copy className="h-4 w-4" />
                    Code {selectedTeam.code}
                  </Button>
                ) : null}
              </div>

              {selectedTeam ? (
                <>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <MetricTile label="Role" value={selectedTeam.role} />
                    <MetricTile label="Members" value={String(selectedTeam.member_count)} />
                    <MetricTile label="Shared ideas" value={String(selectedTeam.ideas.length)} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Share current idea</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {idea
                            ? idea.team_id === selectedTeam.id
                              ? "This idea is already shared with the active team."
                              : "Publish the currently selected saved idea into the team workspace."
                            : "Open a saved idea first, then share it into the team workspace."}
                        </p>
                      </div>
                      <Button
                        onClick={() => void handleShareIdea()}
                        disabled={!idea || idea.team_id === selectedTeam.id || submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                        Share Idea
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyMessage message="Select a team to view members, shared ideas, and collaboration controls." />
              )}
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-sky-300" />
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Members</p>
                </div>

                {selectedTeam ? (
                  <div className="mt-4 space-y-3">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 p-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.full_name} />
                          <div>
                            <p className="font-medium text-white">{member.full_name}</p>
                            <p className="text-sm text-slate-400">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">
                            {member.role}
                          </span>
                          {selectedTeam.role === "leader" && member.role !== "leader" ? (
                            <button
                              type="button"
                              onClick={() => void handleRemoveMember(member.id)}
                              className="rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-200 transition hover:bg-rose-500/15"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyMessage message="Members will appear here once a team is selected." />
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-violet-300" />
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Shared ideas</p>
                </div>

                {selectedTeam ? (
                  selectedTeam.ideas.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {selectedTeam.ideas.map((sharedIdea) => (
                        <div key={sharedIdea.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{sharedIdea.title}</p>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{sharedIdea.description}</p>
                            </div>
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                              {sharedIdea.mode}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                            <span>Innovation {sharedIdea.innovation_score}</span>
                            <span>Similarity {sharedIdea.latest_similarity_score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyMessage message="No ideas have been shared with this team yet." />
                  )
                ) : (
                  <EmptyMessage message="Shared team ideas will appear here after you select a team." />
                )}
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-cyan-300" />
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Team chat</p>
                </div>
                {selectedTeam ? (
                  <>
                    <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
                      {messages.length > 0 ? (
                        messages.map((message) => {
                          const isCurrentUser = message.user_id === readAuthUser()?.id;
                          return (
                            <div
                              key={message.id}
                              className={`rounded-2xl border p-4 ${
                                isCurrentUser ? "border-cyan-300/20 bg-cyan-400/10" : "border-white/10 bg-black/15"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-white">{message.full_name}</p>
                                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-300">{message.content}</p>
                            </div>
                          );
                        })
                      ) : (
                        <EmptyMessage message="No team messages yet. Start the conversation below." />
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <textarea
                        value={messageDraft}
                        onChange={(event) => setMessageDraft(event.target.value)}
                        rows={3}
                        placeholder="Share an update, blocker, or decision with your team."
                        className="w-full rounded-[1.25rem] border border-white/10 bg-[#06111f] px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-cyan-300/40"
                      />
                      <Button onClick={() => void handleSendMessage()} disabled={submitting || messageDraft.trim().length < 1}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                        Send Message
                      </Button>
                    </div>
                  </>
                ) : (
                  <EmptyMessage message="Select a team to open the live team chat." />
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-violet-300" />
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Activity log</p>
                </div>

                {selectedTeam ? (
                  <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                    {activity.length > 0 ? (
                      activity.map((event) => (
                        <div key={event.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold text-white">{event.full_name}</p>
                            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                              {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-cyan-200">{event.action.replaceAll("_", " ")}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{event.detail}</p>
                        </div>
                      ))
                    ) : (
                      <EmptyMessage message="Team activity will appear here as members collaborate." />
                    )}
                  </div>
                ) : (
                  <EmptyMessage message="Select a team to view collaboration activity." />
                )}
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">{message}</div>;
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
      <Loader2 className="h-4 w-4 animate-spin text-sky-300" />
      {label}
    </div>
  );
}
