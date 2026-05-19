import { createHash } from "crypto";

import { GenerateCertificateResponse } from "@/types/api";

const PLATFORM_SIGNATURE = "Innovation Intelligence Registrar";

export function generateCertificate(
  ideaName: string,
  uniquenessScore: number,
  userId: string,
): GenerateCertificateResponse {
  const issueDate = new Date().toISOString();
  const certificateId = buildCertificateId(ideaName, uniquenessScore, userId, issueDate);

  return {
    certificateId,
    ideaName,
    uniquenessScore: Number(uniquenessScore.toFixed(2)),
    issueDate,
    userId,
    platformSignature: PLATFORM_SIGNATURE,
  };
}

function buildCertificateId(ideaName: string, uniquenessScore: number, userId: string, issueDate: string) {
  const hash = createHash("sha256")
    .update(`${ideaName}:${uniquenessScore}:${userId}:${issueDate}`)
    .digest("hex")
    .slice(0, 12)
    .toUpperCase();

  return `AIA-${hash}`;
}
