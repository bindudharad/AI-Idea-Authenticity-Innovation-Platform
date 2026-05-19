import { AnalyzeIdeaResponse, InnovationMapDatum, InnovationMapResponse, IntegratedIdeaAnalysisResponse } from "@/types/api";

type CountryInfo = {
  code: string;
  name: string;
  lat: number;
  lon: number;
};

const COUNTRY_REGISTRY: Record<string, CountryInfo> = {
  US: { code: "US", name: "USA", lat: 39.8283, lon: -98.5795 },
  IN: { code: "IN", name: "India", lat: 22.5937, lon: 78.9629 },
  DE: { code: "DE", name: "Germany", lat: 51.1657, lon: 10.4515 },
  JP: { code: "JP", name: "Japan", lat: 36.2048, lon: 138.2529 },
  SG: { code: "SG", name: "Singapore", lat: 1.3521, lon: 103.8198 },
  GB: { code: "GB", name: "United Kingdom", lat: 55.3781, lon: -3.436 },
  CA: { code: "CA", name: "Canada", lat: 56.1304, lon: -106.3468 },
  FR: { code: "FR", name: "France", lat: 46.2276, lon: 2.2137 },
  AU: { code: "AU", name: "Australia", lat: -25.2744, lon: 133.7751 },
  KR: { code: "KR", name: "South Korea", lat: 35.9078, lon: 127.7669 },
  CH: { code: "CH", name: "Switzerland", lat: 46.8182, lon: 8.2275 },
  NL: { code: "NL", name: "Netherlands", lat: 52.1326, lon: 5.2913 },
  SE: { code: "SE", name: "Sweden", lat: 60.1282, lon: 18.6435 },
};

const COUNTRY_KEYWORDS: Array<{ pattern: RegExp; code: keyof typeof COUNTRY_REGISTRY }> = [
  { pattern: /\busa\b|\bunited states\b|\bamerica\b|\bus\b/i, code: "US" },
  { pattern: /\bindia\b|\bindian\b/i, code: "IN" },
  { pattern: /\bgermany\b|\bgerman\b/i, code: "DE" },
  { pattern: /\bjapan\b|\bjapanese\b/i, code: "JP" },
  { pattern: /\bsingapore\b/i, code: "SG" },
  { pattern: /\buk\b|\bunited kingdom\b|\bbritain\b|\bengland\b/i, code: "GB" },
  { pattern: /\bcanada\b|\bcanadian\b/i, code: "CA" },
  { pattern: /\bfrance\b|\bfrench\b/i, code: "FR" },
  { pattern: /\baustralia\b|\baustralian\b/i, code: "AU" },
  { pattern: /\bkorea\b|\bseoul\b/i, code: "KR" },
  { pattern: /\bswitzerland\b|\bswiss\b/i, code: "CH" },
  { pattern: /\bnetherlands\b|\bdutch\b/i, code: "NL" },
  { pattern: /\bsweden\b|\bswedish\b/i, code: "SE" },
];

export function buildInnovationMapData(analysis: AnalyzeIdeaResponse): InnovationMapResponse {
  const external = analysis.external_intelligence;
  const bucket = new Map<string, InnovationMapDatum>();

  const patents = external?.patents ?? [];
  const githubRepos = external?.githubRepos ?? [];
  const techSignals = external?.ideaAnalysis.technologies ?? analysis.idea_profile.technology_stack ?? [];
  const launchCountries = analysis.market_insights.best_countries_for_launch ?? [];

  patents.forEach((patent, index) => {
    const code = detectCountryCode(`${patent.applicant} ${patent.title}`) ?? fallbackLaunchCountryCode(launchCountries, index) ?? "US";
    incrementCountry(bucket, code, { patents: 1, count: 1 });
  });

  githubRepos.forEach((repo, index) => {
    const code = detectCountryCode(`${repo.name} ${repo.description}`) ?? fallbackTechCountryCode(techSignals, launchCountries, index);
    incrementCountry(bucket, code, { repositories: 1, count: 1 });
  });

  techSignals.forEach((technology, index) => {
    const code = fallbackTechCountryCode([technology], launchCountries, index);
    incrementCountry(bucket, code, { technologies: 1, count: 1 });
  });

  if (bucket.size === 0) {
    ["US", "IN", "DE"].forEach((code, index) => {
      incrementCountry(bucket, code, { count: 3 - index, technologies: 1, repositories: index === 0 ? 1 : 0 });
    });
  }

  return {
    data: Array.from(bucket.values()).sort((left, right) => right.count - left.count),
    sourceFingerprint: buildFingerprint(analysis, external),
  };
}

function incrementCountry(
  bucket: Map<string, InnovationMapDatum>,
  code: string,
  delta: Partial<Pick<InnovationMapDatum, "count" | "patents" | "repositories" | "technologies">>,
) {
  const info = COUNTRY_REGISTRY[code] ?? COUNTRY_REGISTRY.US;
  const current =
    bucket.get(code) ??
    ({
      country: info.code,
      countryName: info.name,
      count: 0,
      patents: 0,
      repositories: 0,
      technologies: 0,
      latitude: info.lat,
      longitude: info.lon,
    } satisfies InnovationMapDatum);

  current.count += delta.count ?? 0;
  current.patents += delta.patents ?? 0;
  current.repositories += delta.repositories ?? 0;
  current.technologies += delta.technologies ?? 0;
  bucket.set(code, current);
}

function detectCountryCode(text: string) {
  const match = COUNTRY_KEYWORDS.find((entry) => entry.pattern.test(text));
  return match?.code;
}

function fallbackLaunchCountryCode(launchCountries: string[], index: number) {
  if (launchCountries.length === 0) {
    return undefined;
  }
  return countryNameToCode(launchCountries[index % launchCountries.length]);
}

function fallbackTechCountryCode(technologies: string[], launchCountries: string[], index: number) {
  const joined = technologies.join(" ").toLowerCase();
  if (joined.includes("fintech") || joined.includes("payments")) {
    return "SG";
  }
  if (joined.includes("robot") || joined.includes("manufacturing") || joined.includes("iot")) {
    return "JP";
  }
  if (joined.includes("climate") || joined.includes("energy")) {
    return "DE";
  }
  if (joined.includes("health") || joined.includes("bio")) {
    return "CH";
  }
  if (joined.includes("developer") || joined.includes("open source") || joined.includes("ai")) {
    return index % 2 === 0 ? "US" : "IN";
  }
  return fallbackLaunchCountryCode(launchCountries, index) ?? "US";
}

function countryNameToCode(value: string) {
  const normalized = value.toLowerCase().trim();
  const entry = Object.values(COUNTRY_REGISTRY).find(
    (item) => item.name.toLowerCase() === normalized || (item.code === "US" && normalized === "united states"),
  );
  return entry?.code;
}

function buildFingerprint(analysis: AnalyzeIdeaResponse, external: IntegratedIdeaAnalysisResponse | undefined) {
  return `${analysis.idea_name}:${analysis.innovation_score}:${external?.patents.length ?? 0}:${external?.githubRepos.length ?? 0}`;
}
