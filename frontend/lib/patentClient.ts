import { rememberAsync } from "@/lib/runtimeCache";

export type PatentSearchResult = {
  title: string;
  applicant: string;
  patentNumber: string;
  filingDate: string;
};

export async function searchPatents(keyword: string): Promise<PatentSearchResult[]> {
  return rememberAsync(`patent:${keyword}`, async () => {
    const endpoint = process.env.USPTO_API || "https://api.uspto.gov/api/v1/patent/applications/search";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          searchText: keyword,
          start: 0,
          rows: 5,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        return [];
      }

      const payload = await response.json();
      const results = extractPatentItems(payload).slice(0, 5);
      return results.map((item) => ({
        title: String(item.inventionTitle ?? item.title ?? item.inventionTitleText ?? "Patent filing"),
        applicant: String(item.firstApplicantName ?? item.applicant ?? "Unknown applicant"),
        patentNumber: String(item.patentNumber ?? item.applicationNumberText ?? item.applicationNumber ?? "Pending"),
        filingDate: String(item.filingDate ?? item.filingDateText ?? "Unknown"),
      }));
    } catch {
      return [];
    }
  }, 20 * 60 * 1000);
}

function extractPatentItems(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) {
    return payload as Array<Record<string, unknown>>;
  }
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const key of ["results", "patentApplications", "patents", "items", "data"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as Array<Record<string, unknown>>;
    }
  }
  return [];
}
