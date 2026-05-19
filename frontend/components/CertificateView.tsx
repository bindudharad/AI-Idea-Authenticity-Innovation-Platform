import { CertificateTemplate } from "@/components/CertificateTemplate";
import { CertificateRecord } from "@/types/api";

export function CertificateView({ certificate }: { certificate: CertificateRecord }) {
  return <CertificateTemplate certificate={certificate} />;
}
