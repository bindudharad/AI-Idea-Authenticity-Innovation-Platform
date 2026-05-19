import { cleanText } from "@/utils/textCleaner";
import { rememberAsync } from "@/lib/runtimeCache";

export type WikipediaSearchResult = {
  title: string;
  snippet: string;
  pageid: number;
  url: string;
};

export async function searchWikipedia(keyword: string): Promise<WikipediaSearchResult[]> {
  return rememberAsync(`wikipedia:${keyword}`, async () => {
    const baseUrl = process.env.WIKIPEDIA_API || process.env.WIKIPEDIA_API_URL || "https://en.wikipedia.org/w/api.php";
    const query = new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: keyword,
      format: "json",
      origin: "*",
    });

    try {
      const response = await fetch(`${baseUrl}?${query.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        return [];
      }

      const payload = await response.json();
      return (payload?.query?.search ?? []).slice(0, 5).map((item: Record<string, unknown>) => ({
        title: String(item.title ?? "Wikipedia Article"),
        snippet: cleanText(String(item.snippet ?? "")),
        pageid: Number(item.pageid ?? 0),
        url: `https://en.wikipedia.org/?curid=${Number(item.pageid ?? 0)}`,
      }));
    } catch {
      return [];
    }
  }, 20 * 60 * 1000);
}
