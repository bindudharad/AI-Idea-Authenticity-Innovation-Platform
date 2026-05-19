import type { AnalyzeIdeaResponse } from "@/types/api";

type BlueprintPersona = {
  name: string;
  age: number;
  role: string;
  liked: string;
  confused: string;
  dropPoint: string;
  satisfaction: number;
};

type BlueprintPhase = {
  phase: string;
  timeEstimate: string;
  tasks: string[];
  tools: string[];
};

type BlueprintRole = {
  role: string;
  skills: string[];
  hiringPlan: string;
  monthlyCostUsd: number;
};

export type StartupBlueprint = {
  problem: string;
  solution: string;
  targetUsers: string[];
  roadmap: BlueprintPhase[];
  techStack: string[];
  requiredApis: string[];
  team: BlueprintRole[];
  costEstimation: {
    mvpBuildUsd: number;
    monthlyRunUsd: number;
    firstYearTeamUsd: number;
  };
  revenueModel: string[];
  pitchSummary: string;
  digitalTwin: BlueprintPersona[];
  simulator: {
    growth: Array<{ month: string; users: number }>;
    revenueProjection: string;
    risks: string[];
    successProbability: number;
  };
  mentor: {
    bestDecision: string;
    alternatives: string[];
    actionSteps: string[];
    riskWarnings: string[];
  };
  global: {
    bestCountries: string[];
    marketGaps: string[];
    expansionPlan: string[];
  };
};

const personaNames = [
  ["Aarav", "Product lead"],
  ["Maya", "Operations manager"],
  ["Noah", "Technical founder"],
  ["Lina", "Innovation analyst"],
  ["Sofia", "Growth strategist"],
] as const;

export function buildStartupBlueprint(analysis: AnalyzeIdeaResponse): StartupBlueprint {
  const targetUsers = analysis.idea_profile.target_users.length > 0
    ? analysis.idea_profile.target_users
    : ["Founders", "Startup teams", "Innovation operators"];

  const technologies = analysis.idea_profile.technology_stack.length > 0
    ? analysis.idea_profile.technology_stack
    : Object.values(analysis.recommended_stack);

  const requiredApis = [
    "OpenAI or Groq for structured AI tasks",
    "PostgreSQL for persistent idea and workspace data",
    "FAISS / vector search for similarity retrieval",
    "Authentication provider or JWT session layer",
    "Analytics / charts for dashboard reporting",
  ];

  const roadmap: BlueprintPhase[] = [
    {
      phase: "Validation",
      timeEstimate: "Week 1",
      tasks: [
        `Interview 8-10 ${targetUsers[0]?.toLowerCase() ?? "target users"}.`,
        "Validate the core pain point and willingness to switch.",
        "Map the top competing workflows and where they break.",
      ],
      tools: ["Founder interviews", "Google Forms", "Notion", "FigJam"],
    },
    {
      phase: "MVP Build",
      timeEstimate: "Weeks 2-5",
      tasks: [
        "Ship the similarity, scoring, and report-generation flow.",
        "Connect saved ideas, certificates, and workspace collaboration.",
        "Instrument core events for activation and retention.",
      ],
      tools: technologies.slice(0, 4),
    },
    {
      phase: "Pilot Launch",
      timeEstimate: "Weeks 6-8",
      tasks: [
        "Launch with a private cohort of 20-50 users.",
        "Track usage on analysis, save idea, and export actions.",
        "Refine recommendations and UI based on friction points.",
      ],
      tools: ["Mixpanel", "PostHog", "Email onboarding", "Feedback forms"],
    },
    {
      phase: "Growth",
      timeEstimate: "Months 3-6",
      tasks: [
        "Package the strongest workflow as a repeatable playbook.",
        "Add templates for startup, hackathon, and investor use cases.",
        "Introduce team plans and premium report exports.",
      ],
      tools: ["Stripe", "CRM", "Content engine", "Customer success"],
    },
  ];

  const team: BlueprintRole[] = [
    {
      role: "Founding product engineer",
      skills: ["Next.js", "FastAPI", "PostgreSQL", "API integration"],
      hiringPlan: "Immediate founder or first full-time hire",
      monthlyCostUsd: 3500,
    },
    {
      role: "AI/ML engineer",
      skills: ["Embeddings", "Retrieval", "Prompt design", "Evaluation"],
      hiringPlan: "Contract first, full-time after pilot traction",
      monthlyCostUsd: 4200,
    },
    {
      role: "Product designer",
      skills: ["Dashboard UX", "Information architecture", "Design systems"],
      hiringPlan: "Part-time or freelance for MVP, then retain",
      monthlyCostUsd: 1800,
    },
    {
      role: "Founder-led growth operator",
      skills: ["Customer discovery", "Partnerships", "Go-to-market"],
      hiringPlan: "Founder-owned until revenue signals are strong",
      monthlyCostUsd: 1200,
    },
  ];

  const avgMonthlyTeam = team.reduce((sum, item) => sum + item.monthlyCostUsd, 0);
  const mvpBuildUsd = Math.round(avgMonthlyTeam * 2.5 + 4500);
  const monthlyRunUsd = Math.round(650 + analysis.market_insights.market_size_billion_usd * 40);
  const firstYearTeamUsd = Math.round(avgMonthlyTeam * 12);

  const baselineUsers = Math.max(25, Math.round(analysis.innovation_score * 1.8));
  const startupPotentialScore = Number(analysis.startup_analysis.startup_potential_score ?? 0);
  const successProbability = Math.max(
    35,
    Math.min(
      92,
      Math.round(
        (analysis.innovation_score + startupPotentialScore + analysis.future_impact.adoption_probability) / 3,
      ),
    ),
  );

  const digitalTwin: BlueprintPersona[] = targetUsers.slice(0, 5).map((user, index) => {
    const [name, roleBase] = personaNames[index] ?? [`User ${index + 1}`, "Early adopter"];
    const risks = analysis.idea_profile.possible_risks[index % Math.max(1, analysis.idea_profile.possible_risks.length)] ?? "Needs clearer positioning";
    const suggestion = analysis.suggestions[index % Math.max(1, analysis.suggestions.length)] ?? "Needs stronger workflow clarity";
    return {
      name,
      age: 24 + index * 5,
      role: `${user} ${roleBase}`,
      liked: `They liked the focus on ${analysis.idea_profile.innovation_category.toLowerCase()} and the promise of faster decision-making.`,
      confused: `They wanted clearer proof around ${risks.toLowerCase()}.`,
      dropPoint: `They hesitated when the product narrative stopped explaining how ${suggestion.toLowerCase()}.`,
      satisfaction: Math.max(62, Math.min(91, Math.round(analysis.innovation_score - analysis.similarity_score / 4 + index * 2))),
    };
  });

  return {
    problem: analysis.idea_profile.problem_statement,
    solution: `${analysis.idea_name} combines ${technologies.slice(0, 3).join(", ")} to solve this workflow with a product that is more differentiated, measurable, and execution-ready.`,
    targetUsers,
    roadmap,
    techStack: Object.values(analysis.recommended_stack).filter(Boolean),
    requiredApis,
    team,
    costEstimation: {
      mvpBuildUsd,
      monthlyRunUsd,
      firstYearTeamUsd,
    },
    revenueModel: [
      "Free analysis tier to drive adoption and community sharing.",
      "Pro subscription for deep reports, certificates, and saved workspaces.",
      "Team plan for collaboration, version tracking, and exports.",
      "Enterprise package for private deployments and custom evaluation logic.",
    ],
    pitchSummary: `${analysis.idea_name} targets ${targetUsers.slice(0, 2).join(" and ")} with a differentiated ${analysis.idea_profile.industry} workflow, scoring ${Math.round(analysis.innovation_score)} on innovation and showing strongest launch potential in ${analysis.market_insights.best_countries_for_launch.slice(0, 2).join(" and ")}.`,
    digitalTwin,
    simulator: {
      growth: [
        { month: "Month 1", users: baselineUsers },
        { month: "Month 3", users: Math.round(baselineUsers * 2.8) },
        { month: "Month 6", users: Math.round(baselineUsers * 6.4) },
        { month: "Month 12", users: Math.round(baselineUsers * 14.2) },
      ],
      revenueProjection: `$${Math.round((baselineUsers * 14.2) * 18 * 0.22).toLocaleString()} ARR-equivalent if 22% of year-one active users convert to a $18 monthly plan.`,
      risks: analysis.idea_profile.possible_risks.slice(0, 4),
      successProbability,
    },
    mentor: {
      bestDecision: `Focus the MVP on ${targetUsers[0]?.toLowerCase() ?? "the clearest early adopter"} first and ship one high-trust workflow before broadening the product.`,
      alternatives: [
        "Launch as a founder tool first, then expand to team collaboration.",
        "Start with hackathon users to gather fast feedback loops.",
        "Package the engine as an API before building a heavier dashboard product.",
      ],
      actionSteps: [
        "Validate one painful workflow with real user interviews this week.",
        "Ship a narrow MVP with measurable outputs and saved workspaces.",
        "Use the strongest report/export behavior as the monetization wedge.",
      ],
      riskWarnings: [
        "Do not overbuild advanced AI layers before proving repeat usage.",
        "Similarity intelligence alone is not enough without execution guidance.",
        "If onboarding is vague, users will not understand why your score is credible.",
      ],
    },
    global: {
      bestCountries: analysis.market_insights.best_countries_for_launch,
      marketGaps: [
        "Most competing tools stop at idea scoring and do not provide execution help.",
        "Few products unify novelty, investor readiness, and collaboration in one flow.",
        "There is whitespace for region-aware startup guidance rather than generic AI advice.",
      ],
      expansionPlan: [
        `Start in ${analysis.market_insights.best_countries_for_launch[0] ?? "the strongest launch market"} with a narrow ICP.`,
        "Expand into the second launch market once activation and retention are stable.",
        "Add organization and university workflows as a higher-trust distribution channel.",
      ],
    },
  };
}
