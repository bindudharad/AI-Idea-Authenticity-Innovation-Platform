"use client";

import dynamic from "next/dynamic";

import { PageShell } from "@/components/layout/page-shell";
import { IdeaLoader } from "@/components/shared/idea-loader";

const LocationProfitIntelligence = dynamic(
  () => import("@/components/market/location-profit-intelligence").then((mod) => mod.LocationProfitIntelligence),
  {
    ssr: false,
    loading: () => <IdeaLoader title="Opening location intelligence..." description="Loading profit zones, competition pockets, and launch recommendations." />,
  },
);

export default function LocationPage() {
  return (
    <PageShell
      title="Location Intelligence"
      description="Choose a city and business type to discover high-profit zones, competition-heavy areas, and realistic launch recommendations."
    >
      <LocationProfitIntelligence />
    </PageShell>
  );
}
