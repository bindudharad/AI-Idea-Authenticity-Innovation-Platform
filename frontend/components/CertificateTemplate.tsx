"use client";

import { Award, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { CertificateRecord } from "@/types/api";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";
import { formatStableDate } from "@/lib/format";
export function CertificateTemplate({ certificate }: { certificate: CertificateRecord }) {
  const verificationUrl = getCertificateUrl(certificate.certificateId);

  return (
    <div className="relative overflow-hidden rounded-[40px] border-[10px] border-[#b88a2f] bg-[radial-gradient(circle_at_top,rgba(203,164,69,0.12),transparent_26%),linear-gradient(135deg,#09101d,#0e1626_54%,#111b2f)] p-6 shadow-[0_32px_90px_rgba(0,0,0,0.45)] md:p-10">
      <div className="pointer-events-none absolute inset-4 rounded-[32px] border border-[#d9ba72]/80" />
      <div className="pointer-events-none absolute inset-10 rounded-[24px] border border-[#8f6a24]/80" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[86px] font-semibold tracking-[0.42em] text-white/[0.04]">
        VERIFIED
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <motion.div
            initial={false}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="team-badge rounded-full border border-[#d9ba72]/60 bg-white/5 p-3"
          >
            <Image
              src={imageWithVersion(TEAM_VORTEX_ICON)}
              alt="Team Vortex"
              width={72}
              height={72}
              className="team-float h-14 w-14 object-contain"
            />
          </motion.div>
          <p className="team-vortex-text text-xs uppercase tracking-[0.34em] text-[#e6c373]">Team_Vortex Innovation Engine</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">TEAM_VORTEX · AI Innovation Intelligence Platform</p>
        </div>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs uppercase tracking-[0.34em] text-[#d3b068]">AI Idea Authenticity Platform</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[0.18em] text-white md:text-5xl">CERTIFICATE OF INNOVATION</h2>
            <p className="mt-4 text-sm uppercase tracking-[0.22em] text-slate-400">Official Authenticity Record</p>
          </div>

          <div className="mx-auto lg:mx-0">
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-[3px] border-[#cfa451] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_45%),linear-gradient(135deg,#162132,#0c1320)] text-center shadow-[0_0_40px_rgba(207,164,81,0.18)]">
              <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Team Vortex" width={44} height={44} className="certificate-seal" />
              <Award className="h-7 w-7 text-[#f0cd78]" />
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f2d283]">AI Verified</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-300">Innovation Certificate</p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[30px] border border-[#caa24f]/40 bg-white/[0.04] px-6 py-8 text-center lg:px-10">
          <p className="text-base leading-8 text-slate-200 md:text-lg">
            This certifies that the idea <span className="font-semibold text-white">{certificate.ideaName}</span> has achieved a uniqueness score of{" "}
            <span className="font-semibold text-[#6af0a6]">{Math.round(certificate.uniquenessScore)}%</span> after analysis by the AI Idea Authenticity Platform.
          </p>
          <p className="mt-7 text-6xl font-semibold leading-none text-[#6af0a6] md:text-7xl">
            {Math.round(certificate.uniquenessScore)}%
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.26em] text-slate-400">Uniqueness Score</p>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-2">
            <TemplateField label="Certificate ID" value={certificate.certificateId} />
            <TemplateField label="Issue Date" value={formatStableDate(certificate.issueDate)} />
            <TemplateField label="Platform Signature" value={certificate.platformSignature} />
            <TemplateField label="Verification Route" value={`/certificate/${certificate.certificateId}`} />
          </div>

          <div className="rounded-[28px] border border-[#caa24f]/40 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#f0cd78]" />
              <p className="text-sm uppercase tracking-[0.24em] text-[#e6c373]">Verification QR</p>
            </div>
            <div className="mt-5 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="rounded-[24px] bg-white p-4">
                <QRCodeSVG value={verificationUrl} size={108} bgColor="#ffffff" fgColor="#0b1220" includeMargin />
              </div>
              <p className="max-w-xs text-sm leading-7 text-slate-300">
                Scan to verify the record at <span className="font-medium text-white">/certificate/{certificate.certificateId}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-[#caa24f]/35 pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#d6b56d]">Registry Seal</p>
            <p className="mt-2 text-sm text-slate-300">Innovation Intelligence Suite certification ledger</p>
          </div>
          <div className="min-w-[220px] border-t border-[#d3b068]/50 pt-3 text-center">
            <p className="font-semibold text-white">{certificate.platformSignature}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#caa24f]/35 bg-black/15 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[#d3b068]">{label}</p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function getCertificateUrl(certificateId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/certificate/${certificateId}`;
}







