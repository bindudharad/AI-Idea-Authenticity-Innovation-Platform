"use client";

import { AlignmentType, BorderStyle, Document, Packer, Paragraph, TextRun } from "docx";

import { CertificateRecord } from "@/types/api";
import { getCertificateUrl } from "@/components/CertificateTemplate";

export async function exportCertificateDOCX(certificate: CertificateRecord) {
  const verificationUrl = getCertificateUrl(certificate.certificateId);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            border: {
              top: { color: "A97D2D", style: BorderStyle.SINGLE, size: 18 },
              bottom: { color: "A97D2D", style: BorderStyle.SINGLE, size: 18 },
              left: { color: "A97D2D", style: BorderStyle.SINGLE, size: 18 },
              right: { color: "A97D2D", style: BorderStyle.SINGLE, size: 18 },
            },
            children: [
              new TextRun({
                text: "CERTIFICATE OF INNOVATION",
                bold: true,
                size: 36,
                color: "D3B068",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: "AI VERIFIED • INNOVATION CERTIFICATE",
                bold: true,
                size: 18,
                color: "FFFFFF",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: `This certifies that the idea ${certificate.ideaName} has achieved a uniqueness score of ${Math.round(certificate.uniquenessScore)}% after analysis by the AI Idea Authenticity Platform.`,
                size: 26,
                color: "FFFFFF",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 260 },
            children: [
              new TextRun({
                text: `${Math.round(certificate.uniquenessScore)}%`,
                bold: true,
                size: 54,
                color: "6AF0A6",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [new TextRun({ text: `Certificate ID: ${certificate.certificateId}`, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [new TextRun({ text: `Issue Date: ${new Date(certificate.issueDate).toLocaleDateString()}`, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 480 },
            children: [new TextRun({ text: `Platform Signature: ${certificate.platformSignature}`, size: 24 })],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [new TextRun({ text: `Verification URL: ${verificationUrl}`, size: 22, color: "D3B068" })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(certificate.ideaName)}-authenticity-certificate.docx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
