import { extractIndustries, extractKeywords, extractProblemStatements, extractTechnologies } from "@/utils/keywordExtractor";
import { truncateText } from "@/utils/textCleaner";

export type GroqIdeaAnalysis = {
  keywords: string[];
  technologies: string[];
  industries: string[];
  targetUsers: string[];
  problems: string[];
  provider: "groq" | "fallback";
};

export async function analyzeIdeaWithGroq(ideaText: string): Promise<GroqIdeaAnalysis> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackIdeaAnalysis(ideaText);
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Return strict JSON with keys: keywords, technologies, industries, targetUsers, problems. Use arrays of short strings only.",
          },
          {
            role: "user",
            content: `Analyze this startup idea and extract industry, technologies, target users and problems:\n\n${truncateText(ideaText, 1600)}`,
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallbackIdeaAnalysis(ideaText);
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = safeParseJson(content);
    if (!parsed) {
      return fallbackIdeaAnalysis(ideaText);
    }

    return {
      keywords: asStringArray(parsed.keywords, extractKeywords(ideaText)),
      technologies: asStringArray(parsed.technologies, extractTechnologies(ideaText)),
      industries: asStringArray(parsed.industries, extractIndustries(ideaText)),
      targetUsers: asStringArray(parsed.targetUsers, ["Startup teams", "Innovation operators"]),
      problems: asStringArray(parsed.problems, extractProblemStatements(ideaText)),
      provider: "groq",
    };
  } catch {
    return fallbackIdeaAnalysis(ideaText);
  }
}

export async function requestGroqJson<T>(
  userPrompt: string,
  fallback: T,
  systemPrompt = "Return strict JSON only.",
): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = safeParseJson(content);
    return parsed ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function fallbackIdeaAnalysis(ideaText: string): GroqIdeaAnalysis {
  return {
    keywords: extractKeywords(ideaText),
    technologies: extractTechnologies(ideaText),
    industries: extractIndustries(ideaText),
    targetUsers: ["Startup teams", "Innovation operators"],
    problems: extractProblemStatements(ideaText),
    provider: "fallback",
  };
}

function safeParseJson(content: string | undefined): Record<string, unknown> | null {
  if (!content) {
    return null;
  }
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items : fallback;
}
