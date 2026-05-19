"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileBadge2, FileText, ShieldCheck } from "lucide-react";

import { requestGenerateCertificate } from "@/api/generateCertificate";
import { CertificateReveal } from "@/components/CertificateReveal";
import { CertificateView } from "@/components/CertificateView";
import {
  readActiveCertificate,
  readCertificates,
  setActiveCertificate,
  storeCertificate,
} from "@/services/certificate-store";
import { readLatestAnalysis } from "@/services/latest-analysis";
import { readLatestIdeaNovelty } from "@/services/latest-idea-novelty";
import { readLatestInvestorInsights } from "@/services/latest-investor-insights";
import { AnalyzeIdeaResponse, CertificateRecord } from "@/types/api";
import { computeInnovationScoreV2 } from "@/engines/innovationScoreEngineV2";
import { exportCertificateDOCX } from "@/utils/exportDOCX";
import { exportCertificatePDF } from "@/utils/exportPDF";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

const DEMO_USER_ID = "demo-user-001";

export function CertificatePreview() {
  const [analysis, setAnalysis] = useState<AnalyzeIdeaResponse | null>(null);
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [revealedCertificate, setRevealedCertificate] = useState<CertificateRecord | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const latestAnalysis = readLatestAnalysis();
    const activeCertificate = readActiveCertificate();
    setAnalysis(latestAnalysis);
    setCertificate(activeCertificate);
    setRevealedCertificate(activeCertificate);
  }, []);

  const innovationScore = useMemo(() => {
    if (!analysis) {
      return 0;
    }
    const novelty = readLatestIdeaNovelty();
    const investor = readLatestInvestorInsights();
    return computeInnovationScoreV2(analysis, novelty, investor).score;
  }, [analysis]);
  const canGenerate = innovationScore >= 90;

  async function handleGenerate() {
    if (!analysis || !canGenerate) {
      setError("Certificate available only for ideas with innovation score above 90%.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generated = await requestGenerateCertificate({
        ideaName: analysis.idea_name,
        uniquenessScore: innovationScore,
        userId: DEMO_USER_ID,
      });
      storeCertificate(generated);
      setCertificate(generated);
      setRevealedCertificate(generated);
      setShowReveal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to generate certificate.";
      setError(message.includes("Certificate available") ? "Certificate available only for ideas with innovation score above 90%." : message);
    } finally {
      setLoading(false);
    }
  }

  const existingCertificates = readCertificates();
  const latestCertificate = certificate ?? existingCertificates.find((item) => item.ideaName === analysis?.idea_name) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        {showReveal && revealedCertificate ? (
          <CertificateReveal
            certificate={revealedCertificate}
            open={showReveal}
            onComplete={() => setShowReveal(false)}
          />
        ) : latestCertificate ? (
          <CertificateView certificate={latestCertificate} />
        ) : (
          <Card className="overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.04]">
            <div className="rounded-[28px] border border-white/10 bg-ink/60 p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-glow/12 p-3 text-glow">
                  <FileBadge2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Guinness-style record certificate</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{analysis?.idea_name ?? "Latest analyzed idea"}</p>
                </div>
              </div>
              <p className="mt-8 text-sm leading-7 text-slate-200">
                The authenticity certificate is reserved for standout concepts. An idea must reach at least 90% innovation before the system issues an official certificate record.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Innovation score</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{Math.round(innovationScore)}%</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Eligibility</p>
                  <Badge tone={canGenerate ? "success" : "warning"}>{canGenerate ? "Eligible" : "Locked"}</Badge>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {canGenerate
                      ? "This idea is eligible for an official authenticity certificate."
                      : "Certificate available only for ideas with innovation score above 90%."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Certificate actions</p>
        <div className="mt-6 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <ShieldCheck className="h-5 w-5 text-glow" />
            <p className="mt-4 font-medium text-white">Eligibility gate</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Only ideas with innovation score greater than or equal to 90% can generate the official record certificate.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Current innovation</p>
            <p className="mt-3 text-3xl font-semibold text-white">{Math.round(innovationScore)}%</p>
          </div>

          <Button onClick={() => void handleGenerate()} className="w-full" disabled={loading || !canGenerate}>
            {loading ? "Generating..." : "Generate Authenticity Certificate"}
          </Button>

          {latestCertificate ? (
            <>
              <Button variant="secondary" onClick={() => void exportCertificatePDF(latestCertificate)} className="w-full">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button variant="secondary" onClick={() => void exportCertificateDOCX(latestCertificate)} className="w-full">
                <FileText className="h-4 w-4" />
                Download DOCX
              </Button>
            </>
          ) : null}

          <Button href="/profile" variant="ghost" className="w-full">
            My Certificates
          </Button>

          {!canGenerate ? (
            <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Certificate available only for ideas with innovation score above 90%.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}

          {latestCertificate ? (
            <button
              type="button"
              onClick={() => setActiveCertificate(latestCertificate)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.08]"
            >
              View active certificate
            </button>
          ) : (
            <Link href="/results" className="inline-flex w-full items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              Review Latest Analysis
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
