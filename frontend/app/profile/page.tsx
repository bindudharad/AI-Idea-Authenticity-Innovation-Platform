"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CheckCheck,
  Download,
  Eye,
  FileStack,
  History,
  LockKeyhole,
  ScrollText,
} from "lucide-react";

import { CertificateView } from "@/components/CertificateView";
import { Achievements } from "@/components/Achievements";
import { IdeaTimeline } from "@/components/IdeaTimeline";
import { InnovationControlCenter } from "@/components/InnovationControlCenter";
import { InnovationRadar } from "@/components/InnovationRadar";
import { InnovationStats } from "@/components/InnovationStats";
import { OwnershipTimeline } from "@/components/ideas/ownership-timeline";
import { TeamWorkspace } from "@/components/ideas/team-workspace";
import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState } from "@/components/shared/module-state";
import { readAnalysisHistory } from "@/services/analysis-history";
import { readAccessToken, readAuthUser } from "@/services/auth-session";
import { readCertificates, setActiveCertificate } from "@/services/certificate-store";
import { readCurrentIdeaContext, storeCurrentIdeaContext } from "@/services/current-idea";
import { getDemoAccessToken } from "@/services/demo-session";
import { getLatestAnalysisResult, getUserIdeas } from "@/services/idea-service";
import { readSavedAnalysisReports } from "@/services/saved-analysis-reports";
import { Avatar } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { AnalysisResultResponse, CertificateRecord, IdeaResponse, SavedAnalysisReport, StoredAnalysisHistoryEntry } from "@/types/api";
import { exportCertificateDOCX } from "@/utils/exportDOCX";
import { exportCertificatePDF } from "@/utils/exportPDF";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";
import { formatStableDate, formatStableDateTime } from "@/lib/format";

export default function ProfilePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<ReturnType<typeof readAuthUser>>(null);
  const [hasAuth, setHasAuth] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [history, setHistory] = useState<StoredAnalysisHistoryEntry[]>([]);
  const [reports, setReports] = useState<SavedAnalysisReport[]>([]);
  const [serverIdeas, setServerIdeas] = useState<IdeaResponse[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResultResponse | null>(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setAuthUser(readAuthUser());
    setHasAuth(Boolean(readAccessToken()));
    setAuthReady(true);
    setCertificates(readCertificates());
    setHistory(readAnalysisHistory());
    setReports(readSavedAnalysisReports());
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      setServerLoading(true);
      setServerError(null);
      try {
        const token = await getDemoAccessToken();
        if (!token) {
          if (active) {
            setServerIdeas([]);
            setSelectedIdeaId(null);
          }
          return;
        }
        const ideas = await getUserIdeas(token);
        if (!active) {
          return;
        }

        setServerIdeas(ideas);
        const storedContext = readCurrentIdeaContext();
        const preferredIdea =
          ideas.find((item) => item.id === storedContext?.ideaId) ??
          ideas[0] ??
          null;

        setSelectedIdeaId(preferredIdea?.id ?? null);
        if (preferredIdea) {
          storeCurrentIdeaContext({ ideaId: preferredIdea.id, title: preferredIdea.title });
        }
      } catch (error) {
        if (active) {
          setServerError(error instanceof Error ? error.message : "Unable to load server-backed profile data.");
        }
      } finally {
        if (active) {
          setServerLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedIdeaId) {
      setLatestAnalysis(null);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const token = await getDemoAccessToken();
        if (!token) {
          if (active) {
            setLatestAnalysis(null);
          }
          return;
        }
        const response = await getLatestAnalysisResult(selectedIdeaId, token);
        if (active) {
          setLatestAnalysis(response);
        }
      } catch {
        if (active) {
          setLatestAnalysis(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [selectedIdeaId]);

  const selectedIdea = useMemo(
    () => serverIdeas.find((idea) => idea.id === selectedIdeaId) ?? null,
    [selectedIdeaId, serverIdeas],
  );

  const stats = useMemo(
    () => [
      { label: "Ideas registered", value: String(serverIdeas.length || history.length || 0), icon: FileStack },
      { label: "Certificates issued", value: String(certificates.length), icon: CheckCheck },
      {
        label: "Average score",
        value: serverIdeas.length > 0
          ? String(Math.round(serverIdeas.reduce((sum, item) => sum + item.innovation_score, 0) / serverIdeas.length))
          : history.length > 0
            ? String(Math.round(history.reduce((sum, item) => sum + item.innovationScore, 0) / history.length))
            : "0",
        icon: BarChart3,
      },
      { label: "Privacy mode", value: "Private first", icon: LockKeyhole },
    ],
    [certificates.length, history, serverIdeas],
  );

  const innovationStats = useMemo(
    () => [
      { label: "Ideas analyzed", value: serverIdeas.length || history.length || 0, icon: FileStack },
      { label: "Certificates generated", value: certificates.length || 0, icon: CheckCheck },
      {
        label: "Highest score",
        value: serverIdeas.length > 0
          ? Math.max(...serverIdeas.map((item) => item.innovation_score))
          : history.length > 0
            ? Math.max(...history.map((item) => item.innovationScore))
            : 0,
        icon: BarChart3,
      },
      {
        label: "Average score",
        value: serverIdeas.length > 0
          ? Math.round(serverIdeas.reduce((sum, item) => sum + item.innovation_score, 0) / serverIdeas.length)
          : history.length > 0
            ? Math.round(history.reduce((sum, item) => sum + item.innovationScore, 0) / history.length)
            : 0,
        icon: BarChart3,
      },
    ],
    [certificates.length, history, serverIdeas],
  );

  const achievements = useMemo(
    () => [
      {
        id: "innovation-master",
        title: "Innovation Master",
        description: "Unlocked when score > 90",
        unlocked: history.some((item) => item.innovationScore >= 90),
      },
      {
        id: "ai-explorer",
        title: "AI Explorer",
        description: "Unlocked after analyzing 10 ideas",
        unlocked: Math.max(history.length, serverIdeas.length) >= 10,
      },
      {
        id: "global-innovator",
        title: "Global Innovator",
        description: "Unlocked when ideas appear across multiple countries",
        unlocked: certificates.length >= 2,
      },
    ],
    [certificates.length, history, serverIdeas.length],
  );

  const radarMetrics = useMemo(
    () => [
      {
        metric: "Innovation",
        value: serverIdeas.length > 0
          ? Math.round(serverIdeas.reduce((sum, item) => sum + item.innovation_score, 0) / serverIdeas.length)
          : history.length > 0
            ? Math.round(history.reduce((sum, item) => sum + item.innovationScore, 0) / history.length)
            : 78,
      },
      { metric: "Market Potential", value: 82 },
      { metric: "Technology Complexity", value: 76 },
      { metric: "Competition Awareness", value: 68 },
      { metric: "Risk Analysis", value: 64 },
    ],
    [history, serverIdeas],
  );

  if (!authReady) {
    return (
      <PageShell
        title="User Profile Page"
        description="Manage your idea history, generated certificates, saved analysis reports, and collaboration footprint from one professional workspace."
      >
        <Card className="h-48 animate-pulse bg-white/[0.04]">
          <div className="h-full" />
        </Card>
      </PageShell>
    );
  }

  if (!hasAuth) {
    return (
      <PageShell
        title="User Profile Page"
        description="Manage your idea history, generated certificates, saved analysis reports, and collaboration footprint from one professional workspace."
      >
        <AuthRequiredState title="Sign in to open your founder profile" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="User Profile Page"
      description="Manage your idea history, generated certificates, saved analysis reports, and collaboration footprint from one professional workspace."
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={authUser?.full_name ?? "Founder"} />
            <div>
              <h2 className="text-2xl font-semibold text-white">{authUser?.full_name ?? "Founder Workspace"}</h2>
              <p className="text-sm text-slate-400">{authUser?.email ?? "Founder and startup operator"}</p>
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-slate-400">
              <img src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" className="profile-avatar" />
              Powered by TEAM_VORTEX
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-glow" />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-medium text-white">{item.value}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <TeamWorkspace idea={selectedIdea ?? null} />
      </div>

      <InnovationStats stats={innovationStats} />

      <InnovationControlCenter
        recentAnalyses={
          serverIdeas.length > 0
            ? serverIdeas.slice(0, 4).map((item) => ({
                id: String(item.id),
                idea: item.title,
                score: Math.round(item.innovation_score),
              }))
            : history.slice(0, 4).map((item) => ({
                id: item.id,
                idea: item.ideaName,
                score: Math.round(item.innovationScore),
              }))
        }
        globalTrends={["AI validation tools", "Research intelligence", "Founder decision systems"]}
        simulations={3}
      />

      <Card>
        <p className="panel-heading">Idea history</p>
        <h2 className="panel-subtitle">Recent analyses and saved intelligence</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            {serverIdeas.length > 0 ? (
              serverIdeas.slice(0, 8).map((idea) => (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdeaId(idea.id);
                    storeCurrentIdeaContext({ ideaId: idea.id, title: idea.title });
                  }}
                  className={`w-full rounded-[24px] border p-5 text-left transition ${
                    selectedIdeaId === idea.id
                      ? "border-cyan-400/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{idea.title}</p>
                      <p className="mt-2 text-sm text-slate-400">{formatStableDateTime(idea.updated_at)}</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{idea.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Innovation</p>
                      <p className="text-2xl font-semibold text-white">{Math.round(idea.innovation_score)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <ProfileStat label="Similarity" value={`${Math.round(idea.latest_similarity_score)}%`} />
                    <ProfileStat label="Versions" value={String(idea.versions.length)} />
                    <ProfileStat label="Visibility" value={idea.is_public ? "Public" : "Private"} />
                  </div>
                </button>
              ))
            ) : history.length > 0 ? (
              history.slice(0, 8).map((entry) => (
                <div key={entry.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{entry.ideaName}</p>
                      <p className="mt-2 text-sm text-slate-400">{formatStableDateTime(entry.analysisDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Innovation</p>
                      <p className="text-2xl font-semibold text-white">{Math.round(entry.innovationScore)}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <ProfileStat label="Similarity" value={`${Math.round(entry.similarityScore)}%`} />
                    <ProfileStat label="Novelty" value={String(Math.round(entry.noveltyScore))} />
                    <ProfileStat label="Investor" value={String(Math.round(entry.investorScore))} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
                No saved idea history yet. Run an idea analysis to start building your innovation archive.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <ScrollText className="h-4 w-4 text-sky-300" />
                <p className="text-base font-semibold text-white">Saved analysis reports</p>
              </div>
              <div className="mt-4 space-y-3">
                {reports.length > 0 ? (
                  reports.slice(0, 8).map((report) => (
                    <div key={report.id} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
                      <p className="text-sm font-medium text-white">{report.ideaName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {report.format.toUpperCase()} | {formatStableDateTime(report.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-slate-300">
                    Exported PDF and DOCX intelligence reports will appear here after download.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <History className="h-4 w-4 text-violet-300" />
                <p className="text-base font-semibold text-white">Workspace summary</p>
              </div>
              {serverLoading ? (
                <p className="mt-4 text-sm leading-7 text-slate-300">Loading server-backed workspace summary...</p>
              ) : selectedIdea ? (
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                  <p>Selected idea: <span className="font-medium text-white">{selectedIdea.title}</span></p>
                  <p>Latest version count: <span className="font-medium text-white">{selectedIdea.versions.length}</span></p>
                  <p>Visibility: <span className="font-medium text-white">{selectedIdea.is_public ? "Public community idea" : "Private workspace idea"}</span></p>
                  {latestAnalysis ? (
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest backend analysis</p>
                      <p className="mt-2 text-white">{latestAnalysis.ai_summary ?? "Structured analysis stored without summary text."}</p>
                    </div>
                  ) : (
                    <p>No backend analysis snapshot has been saved for this idea yet.</p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  This profile tracks idea history, generated certificates, exported reports, and backend workspace activity in one place.
                </p>
              )}
              {serverError ? (
                <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {serverError}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="panel-heading">My Certificates</p>
        <h2 className="panel-subtitle">Official authenticity records</h2>
        {certificates.length > 0 ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4">
              {certificates.map((certificate) => (
                <div key={certificate.certificateId} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{certificate.ideaName}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        {certificate.certificateId} | {formatStableDate(certificate.issueDate)} | {Math.round(certificate.uniquenessScore)}% innovation
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setActiveCertificate(certificate);
                          router.push("/certificate");
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View certificate
                      </Button>
                      <Button variant="secondary" onClick={() => void exportCertificatePDF(certificate)}>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button variant="secondary" onClick={() => void exportCertificateDOCX(certificate)}>
                        <Download className="h-4 w-4" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <CertificateView certificate={certificates[0]} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
            No certificates yet. Analyze a high-innovation idea and generate an authenticity certificate once the innovation score reaches 90% or higher.
          </div>
        )}
      </Card>

      <IdeaTimeline
        items={
          serverIdeas.length > 0
            ? serverIdeas.map((item) => ({
                id: String(item.id),
                ideaName: item.title,
                innovationScore: item.innovation_score,
                analysisDate: item.updated_at,
              }))
            : history.map((item) => ({
                id: item.id,
                ideaName: item.ideaName,
                innovationScore: item.innovationScore,
                analysisDate: item.analysisDate,
              }))
        }
      />

      <Achievements achievements={achievements} />

      <InnovationRadar metrics={radarMetrics} />

      <OwnershipTimeline versions={selectedIdea?.versions ?? []} ideaTitle={selectedIdea?.title} />
    </PageShell>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
