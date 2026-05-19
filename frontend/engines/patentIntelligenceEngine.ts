import { searchPatents } from "@/lib/patentClient";

export async function scanPatentIntelligence(keywords: string[]) {
  const results = await Promise.all(keywords.slice(0, 3).map((keyword) => searchPatents(keyword)));
  const seen = new Set<string>();
  return results.flat().filter((item) => {
    const key = `${item.patentNumber}:${item.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).slice(0, 8);
}
