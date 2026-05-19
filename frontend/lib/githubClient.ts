import { rememberAsync } from "@/lib/runtimeCache";

export type GitHubRepositoryResult = {
  name: string;
  description: string;
  stars: number;
  url: string;
};

export async function searchGithubRepositories(keyword: string): Promise<GitHubRepositoryResult[]> {
  return rememberAsync(`github:${keyword}`, async () => {
    const apiKey = process.env.GITHUB_API_KEY;
    const params = new URLSearchParams({
      q: keyword,
      sort: "stars",
      order: "desc",
      per_page: "5",
    });

    try {
      const response = await fetch(`https://api.github.com/search/repositories?${params.toString()}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "AI-Idea-Authenticity-Platform",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        return [];
      }

      const payload = await response.json();
      return (payload?.items ?? []).slice(0, 5).map((item: Record<string, unknown>) => ({
        name: String(item.full_name ?? item.name ?? "repository"),
        description: String(item.description ?? "No description provided."),
        stars: Number(item.stargazers_count ?? 0),
        url: String(item.html_url ?? ""),
      }));
    } catch {
      return [];
    }
  }, 20 * 60 * 1000);
}
