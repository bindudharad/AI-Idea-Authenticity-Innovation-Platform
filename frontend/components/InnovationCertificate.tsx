"use client";

import { CertificateRecord } from "@/types/api";
import { CertificateTemplate } from "@/components/CertificateTemplate";

export function InnovationCertificate({ certificate }: { certificate: CertificateRecord }) {
  return <CertificateTemplate certificate={certificate} />;
}
