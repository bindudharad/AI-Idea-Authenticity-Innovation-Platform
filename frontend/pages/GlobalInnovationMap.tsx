"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Globe2, MapPinned, Radar, ScanSearch } from "lucide-react";

import { InnovationMap } from "@/components/InnovationMap";
import { GraphContainer } from "@/components/dashboard/graph-container";
import { MetricCard } from "@/components/dashboard/metric-card";
import { useLatestAnalysis } from "@/components/insights/use-latest-analysis";
import { buildInnovationMapData } from "@/engines/globalInnovationMapEngine";
import { readLatestInnovationMap, storeLatestInnovationMap } from "@/services/latest-innovation-map";
import { Card } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";

export default function GlobalInnovationMapPageView() {
  const analysis = useLatestAnalysis();
  const [mapData, setMapData] = useState<ReturnType<typeof readLatestInnovationMap>>(null);
  const [loading, setLoading] = useState(true);

  const fingerprint = useMemo(() => {
    if (!analysis) {
      return null;
    }
    return `${analysis.idea_name}:${analysis.innovation_score}:${analysis.external_intelligence?.patents.length ?? 0}:${analysis.external_intelligence?.githubRepos.length ?? 0}`;
  }, [analysis]);

  useEffect(() => {
    const cached = readLatestInnovationMap();
    if (cached) {
      setMapData(cached);
      setLoading(false);
    }

    if (!analysis) {
      setLoading(false);
      return;
    }

    if (cached?.sourceFingerprint && fingerprint && cached.sourceFingerprint === fingerprint) {
      setLoading(false);
      return;
    }

    const next = buildInnovationMapData(analysis);
    storeLatestInnovationMap(next);
    setMapData(next);
    setLoading(false);
  }, [analysis, fingerprint]);

  if (!analysis && !mapData && !loading) {
    return (
      <Card>
        <p className="panel-heading">No analysis found</p>
        <h2 className="panel-subtitle">Run an idea analysis before opening the global innovation map</h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          The map uses related patents, repositories, and technology signals from the latest idea analysis.
        </p>
        <Link href="/analyze" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
          Go to analysis
        </Link>
      </Card>
    );
  }

  const points = mapData?.data ?? [];
  const totalSignals = points.reduce((sum, item) => sum + item.count, 0);
  const topCountry = points[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Tracked Countries" value={`${points.length}`} detail="Countries with visible innovation evidence tied to the latest idea scan." icon={Globe2} accent="blue" />
        <MetricCard label="Innovation Signals" value={`${totalSignals}`} detail="Combined patent, repository, and technology-origin signals plotted on the map." icon={Radar} accent="violet" />
        <MetricCard label="Top Innovation Hub" value={topCountry?.countryName ?? "--"} detail="The country with the strongest concentration of related innovation signals." icon={MapPinned} accent="emerald" />
        <MetricCard label="Patent-linked Regions" value={`${points.filter((item) => item.patents > 0).length}`} detail="Regions with patent-style signals tied to the surrounding idea space." icon={ScanSearch} accent="amber" />
      </div>

      {loading && !mapData ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Skeleton className="h-[620px] rounded-[30px]" />
          <Skeleton className="h-[620px] rounded-[30px]" />
        </div>
      ) : null}

      {mapData ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <GraphContainer
            eyebrow="Global innovation intelligence"
            title="Global Innovation Intelligence Map"
            copy="Visualize global innovation sources related to your idea."
          >
            <InnovationMap data={mapData.data} />
          </GraphContainer>

          <Card className="panel-hover">
            <p className="panel-heading">Regional hotspots</p>
            <h2 className="panel-subtitle">Where related innovation is clustered</h2>
            <div className="mt-6 space-y-3">
              {mapData.data.map((entry) => (
                <div key={entry.country} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-white">{entry.countryName}</p>
                      <p className="mt-2 text-sm text-slate-400">
                        Patents {entry.patents} • GitHub {entry.repositories} • Tech {entry.technologies}
                      </p>
                    </div>
                    <p className="text-2xl font-semibold text-sky-300">{entry.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
