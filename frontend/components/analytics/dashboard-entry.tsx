"use client";

import dynamic from "next/dynamic";

import ClientOnly from "@/components/ClientOnly";
import { IdeaLoader } from "@/components/shared/idea-loader";

const DashboardClient = dynamic(
  () => import("@/components/analytics/dashboard-client").then((mod) => mod.DashboardClient),
  {
    ssr: false,
    loading: () => <IdeaLoader title="Opening dashboard..." description="Restoring your saved workspace and live AI signals." />,
  },
);

export function DashboardEntry() {
  return (
    <ClientOnly
      fallback={<IdeaLoader title="Opening dashboard..." description="Restoring your saved workspace and live AI signals." />}
    >
      <DashboardClient />
    </ClientOnly>
  );
}
