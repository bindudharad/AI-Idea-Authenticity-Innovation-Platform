"use client";

import jsPDF from "jspdf";
import QRCode from "qrcode";

import { CertificateRecord } from "@/types/api";
import { getCertificateUrl } from "@/components/CertificateTemplate";

export async function exportCertificatePDF(certificate: CertificateRecord) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const verificationUrl = getCertificateUrl(certificate.certificateId);
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    margin: 1,
    color: {
      dark: "#0b1220",
      light: "#ffffff",
    },
    width: 180,
  });

  doc.setFillColor(10, 16, 29);
  doc.rect(0, 0, 842, 595, "F");

  doc.setDrawColor(184, 138, 47);
  doc.setLineWidth(9);
  doc.rect(28, 28, 786, 539);
  doc.setLineWidth(1.4);
  doc.rect(42, 42, 758, 511);
  doc.setLineWidth(0.8);
  doc.rect(56, 56, 730, 483);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text("AI IDEA AUTHENTICITY PLATFORM", 421, 92, { align: "center" });

  doc.setTextColor(211, 176, 104);
  doc.setFontSize(28);
  doc.text("CERTIFICATE OF INNOVATION", 421, 140, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  const content =
    `This certifies that the idea ${certificate.ideaName} has achieved a uniqueness score of ${Math.round(certificate.uniquenessScore)}% after analysis by the AI Idea Authenticity Platform.`;
  const wrapped = doc.splitTextToSize(content, 580);
  doc.text(wrapped, 421, 220, { align: "center" });

  doc.setTextColor(106, 240, 166);
  doc.setFontSize(64);
  doc.text(`${Math.round(certificate.uniquenessScore)}%`, 421, 322, { align: "center" });
  doc.setFontSize(13);
  doc.text("UNIQUENESS SCORE", 421, 346, { align: "center" });

  doc.setTextColor(211, 176, 104);
  doc.setFontSize(12);
  doc.text(`Certificate ID`, 88, 430);
  doc.text(`Issue Date`, 88, 474);
  doc.text(`Platform Signature`, 88, 518);
  doc.text(`Verification Route`, 520, 430);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(certificate.certificateId, 88, 450);
  doc.text(formatCertificateDate(certificate.issueDate), 88, 494);
  doc.text(certificate.platformSignature, 88, 538);
  doc.text(`/certificate/${certificate.certificateId}`, 520, 450);

  doc.setDrawColor(211, 176, 104);
  doc.line(520, 522, 744, 522);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.text("Authorized signature", 632, 540, { align: "center" });

  doc.setDrawColor(207, 164, 81);
  doc.setFillColor(18, 27, 46);
  doc.circle(716, 118, 42, "FD");
  doc.setTextColor(240, 205, 120);
  doc.setFontSize(9);
  doc.text("AI VERIFIED", 716, 110, { align: "center" });
  doc.text("INNOVATION", 716, 123, { align: "center" });
  doc.text("CERTIFICATE", 716, 136, { align: "center" });

  doc.addImage(qrDataUrl, "PNG", 628, 430, 116, 116);

  doc.save(`${slugify(certificate.ideaName)}-authenticity-certificate.pdf`);
}

function formatCertificateDate(date: string) {
  return new Date(date).toLocaleDateString();
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
