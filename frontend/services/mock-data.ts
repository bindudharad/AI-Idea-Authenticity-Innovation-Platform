import { AnalysisSnapshot, CommunityIdea, SimilarIdea, TrendPoint } from "@/types/idea";

export const sampleAnalysis: AnalysisSnapshot = {
  ideaName: "AI Idea Authenticity & Innovation Platform",
  mode: "hackathon",
  similarity: 34,
  innovation: 66,
  originality: 66,
  feasibility: 79,
  complexity: 71,
  marketPotential: 84
};

export const similarIdeas: SimilarIdea[] = [
  {
    title: "HackSense Judge Assistant",
    description: "AI-driven project validation workspace for student hackathons.",
    source: "Hackathon Submission",
    score: 34
  },
  {
    title: "Startup Patent Pulse",
    description: "Idea novelty dashboard comparing startup concepts against the market.",
    source: "Startup Database",
    score: 29
  },
  {
    title: "Research Similarity Lens",
    description: "Research abstract similarity analyzer for academic labs and incubators.",
    source: "Research Paper",
    score: 26
  },
  {
    title: "OpenForge Compare",
    description: "Repository matcher for open source product ideas and MVP scopes.",
    source: "GitHub",
    score: 22
  }
];

export const trendData: TrendPoint[] = [
  { technology: "AI", adoption: 92, momentum: 96, investment: 95 },
  { technology: "IoT", adoption: 80, momentum: 76, investment: 72 },
  { technology: "Robotics", adoption: 74, momentum: 82, investment: 79 },
  { technology: "Blockchain", adoption: 62, momentum: 68, investment: 70 },
  { technology: "Climate", adoption: 71, momentum: 88, investment: 86 }
];

export const communityIdeas: CommunityIdea[] = [
  {
    id: 1,
    title: "Civic AI Budget Twin",
    description: "A simulation dashboard helping municipalities model policy tradeoffs in real time.",
    category: "GovTech",
    source: "Community",
    innovation: 88,
    popularity: 93,
    date: "2026-03-12T10:00:00Z"
  },
  {
    id: 2,
    title: "BioSignal Coach",
    description: "Wearable-linked rehabilitation assistant for recovery tracking and clinician collaboration.",
    category: "HealthTech",
    source: "Community",
    innovation: 84,
    popularity: 87,
    date: "2026-03-14T14:30:00Z"
  },
  {
    id: 3,
    title: "Founder Due Diligence Copilot",
    description: "Startup workspace that benchmarks pitches, risk, and defensibility before investor review.",
    category: "Startup Tools",
    source: "Community",
    innovation: 81,
    popularity: 90,
    date: "2026-03-15T09:15:00Z"
  },
  {
    id: 4,
    title: "EduVerse Lab Builder",
    description: "Interactive lab creation suite for universities to produce AI-guided virtual experiments.",
    category: "EdTech",
    source: "Community",
    innovation: 79,
    popularity: 76,
    date: "2026-03-11T16:45:00Z"
  }
];

export const certificateFields = {
  ideaName: "AI Idea Authenticity & Innovation Platform",
  owner: "Aarav Mehta",
  date: "March 10, 2026",
  innovationScore: 66
};
