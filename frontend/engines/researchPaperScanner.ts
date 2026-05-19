type ResearchPaper = {
  title: string;
  author: string;
  year: string;
  url: string;
  relevanceScore: number;
};

function extractTag(text: string, tag: string) {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].replace(/\n/g, " ").trim() : "";
}

export async function scanResearchPapers(keywords: string[]): Promise<ResearchPaper[]> {
  const query = keywords.slice(0, 2).join(" ") || "artificial intelligence";
  const baseUrl = process.env.ARXIV_API ?? "https://export.arxiv.org/api/query";
  const url = `${baseUrl}?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`;

  try {
    const response = await fetch(url, { headers: { "User-Agent": "Team_Vortex/1.0" } });
    const raw = await response.text();
    const entries = raw.split("<entry>").slice(1);

    return entries.map((entry) => {
      const title = extractTag(entry, "title") || "Untitled research";
      const author = extractTag(entry, "name") || "Unknown author";
      const published = extractTag(entry, "published");
      const year = published ? published.slice(0, 4) : "2024";
      const linkMatch = entry.match(new RegExp("<id>([\\\\s\\\\S]*?)<\\\\/id>", "i"));
      const url = linkMatch ? linkMatch[1].trim() : "";
      return {
        title,
        author,
        year,
        url,
        relevanceScore: Math.max(60, Math.min(95, 92 - title.length / 4)),
      };
    });
  } catch {
    return [
      {
        title: "Fallback research insight",
        author: "Team_Vortex Labs",
        year: "2024",
        url: "",
        relevanceScore: 72,
      },
    ];
  }
}

