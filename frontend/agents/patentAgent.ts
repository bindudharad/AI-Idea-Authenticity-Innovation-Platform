import { searchPatents } from "@/lib/patentClient";

export async function runPatentAgent(input: { keywords: string[] }) {
  const results = await Promise.all(input.keywords.slice(0, 3).map((keyword) => searchPatents(keyword)));
  const flattened = results.flat();
  const seen = new Set<string>();
  return flattened.filter((item) => {
    const key = `${item.patentNumber}-${item.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).slice(0, 8);
}
