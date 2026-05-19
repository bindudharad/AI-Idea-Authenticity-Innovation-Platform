"use client";

import { CertificateRecord } from "@/types/api";

const CERTIFICATE_STORE_KEY = "idea_platform_certificates";
const ACTIVE_CERTIFICATE_KEY = "idea_platform_active_certificate";

export function readCertificates(): CertificateRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(CERTIFICATE_STORE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CertificateRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(CERTIFICATE_STORE_KEY);
    return [];
  }
}

export function storeCertificate(record: CertificateRecord) {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readCertificates();
  const next = [record, ...existing.filter((item) => item.certificateId !== record.certificateId)];
  window.localStorage.setItem(CERTIFICATE_STORE_KEY, JSON.stringify(next));
  setActiveCertificate(record);
}

export function readActiveCertificate(): CertificateRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ACTIVE_CERTIFICATE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CertificateRecord;
  } catch {
    window.localStorage.removeItem(ACTIVE_CERTIFICATE_KEY);
    return null;
  }
}

export function setActiveCertificate(record: CertificateRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_CERTIFICATE_KEY, JSON.stringify(record));
}
