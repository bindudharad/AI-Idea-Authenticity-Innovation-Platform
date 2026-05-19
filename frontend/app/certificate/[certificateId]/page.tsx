"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { CertificateView } from "@/components/CertificateView";
import { Navbar } from "@/components/layout/navbar";
import { readCertificates } from "@/services/certificate-store";
import { CertificateRecord } from "@/types/api";
import { Card } from "@/ui/card";

export default function CertificateRecordPage() {
  const params = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);

  const certificateId = useMemo(() => String(params?.certificateId ?? ""), [params]);

  useEffect(() => {
    const records = readCertificates();
    setCertificate(records.find((item) => item.certificateId === certificateId) ?? null);
  }, [certificateId]);

  return (
    <>
      <Navbar />
      <main className="section-shell py-10">
        {certificate ? (
          <CertificateView certificate={certificate} />
        ) : (
          <Card>
            <p className="panel-heading">Certificate not found</p>
            <h1 className="panel-subtitle">No local certificate record matches this ID</h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Generate or open a certificate from your profile to view the full record in this verification route.
            </p>
            <Link href="/profile" className="mt-6 inline-flex rounded-full bg-glow px-5 py-3 text-sm font-semibold text-ink">
              Go to profile
            </Link>
          </Card>
        )}
      </main>
    </>
  );
}
