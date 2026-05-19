import { IdeaType, PlatformMode } from "@/types/idea";

export type AnalyzeIdeaPayload = {
  idea_name: string;
  idea_text: string;
  mode: PlatformMode;
  idea_type?: IdeaType;
};

export type FullAnalysisPayload = {
  idea: string;
  idea_name: string;
  idea_type: IdeaType;
  location?: {
    country: string;
    state: string;
    city: string;
  };
};

export type FullAnalysisResponse = {
  idea_engine: Record<string, unknown>;
  location_intelligence: Record<string, unknown>;
  competitor_engine: Record<string, unknown>;
  financial_engine: Record<string, unknown>;
  funding_engine: Record<string, unknown>;
  business_blueprint: Record<string, unknown>;
  growth_engine: Record<string, unknown>;
  recommendation_ai: Record<string, unknown>;
  source_analysis: AnalyzeIdeaResponse;
};

export type WikipediaSearchResult = {
  title: string;
  snippet: string;
  pageid: number;
  url: string;
};

export type PatentSearchResult = {
  title: string;
  applicant: string;
  patentNumber: string;
  filingDate: string;
};

export type GitHubRepositoryResult = {
  name: string;
  description: string;
  stars: number;
  url: string;
};

export type ResearchPaperResult = {
  title: string;
  author: string;
  year: string;
  url: string;
  relevanceScore: number;
};

export type ExternalSimilarityMatch = {
  id: string;
  title: string;
  text: string;
  source: string;
  url?: string;
  similarity: number;
};

export type ExternalSimilarityResult = {
  similarityScore: number;
  closestMatches: ExternalSimilarityMatch[];
};

export type ExternalInnovationScoreResult = {
  innovationScore: number;
  similarityScore: number;
  competitionLevel: string;
  technologyNovelty: number;
  competitionPenalty: number;
};

export type IntegratedIdeaAnalysisPayload = {
  ideaName: string;
  ideaDescription: string;
  idea_type?: IdeaType;
};

export type IntegratedIdeaAnalysisResponse = {
  ideaName?: string;
  idea_type?: IdeaType;
  ideaAnalysis: {
    keywords: string[];
    technologies: string[];
    industries: string[];
    targetUsers: string[];
    problems: string[];
    provider: "groq" | "fallback";
  };
  patents: PatentSearchResult[];
  wikipedia: WikipediaSearchResult[];
  githubRepos: GitHubRepositoryResult[];
  researchPapers?: ResearchPaperResult[];
  keywords?: string[];
  similarityScore: number;
  closestMatches: ExternalSimilarityMatch[];
  innovationScore: number;
  improvements?: string[];
  impactPrediction?: {
    marketPotential: string;
    adoptionProbability: number;
    riskLevel: string;
  };
  ideaEvolution?: Array<{
    year: number;
    stage: string;
    summary: string;
  }>;
  investorDecision?: InvestorDecisionResponse;
  novelty?: NoveltyCheckResponse;
  pitchDeck?: GeneratePitchResponse;
  innovationMap?: InnovationMapResponse;
  uniquenessScore?: number;
  certificatePreview?: CertificateRecord;
  matchingResources?: ExternalSimilarityMatch[];
  dashboardSummary?: {
    innovationScore: number;
    similarityScore: number;
    noveltyScore: number;
    investorScore: number;
    marketPotential: string;
  };
  radarMetrics?: {
    innovation: number;
    marketPotential: number;
    technologyReadiness: number;
    competition: number;
    risk: number;
  };
  ideaGraph?: {
    nodes: Array<{ id: string; type: string; label: string; description: string }>;
    edges: Array<{ source: string; target: string; weight: number; label: string }>;
  };
  agentStatus?: Record<string, "success" | "failed">;
  competitionLevel?: string;
  technologyNovelty?: number;
  competitionPenalty?: number;
  providers?: Record<string, string>;
  error?: string;
};

export type SuggestionPayload = {
  idea_text: string;
};

export type IdeaGraphPayload = {
  ideaName: string;
  ideaDescription: string;
  mode: PlatformMode;
};

export type RegisterIdeaPayload = {
  idea_name: string;
  description: string;
  mode: PlatformMode;
  idea_type?: IdeaType;
  is_public: boolean;
  team_id?: string | null;
};

export type UpdateIdeaPayload = {
  description?: string;
  is_public?: boolean;
};

export type SimilarProjectResponse = {
  title: string;
  description: string;
  source: string;
  mode: PlatformMode;
  similarity_score: number;
};

export type AnalyzeIdeaResponse = {
  idea_name: string;
  mode: PlatformMode;
  idea_type?: IdeaType;
  similarity_score: number;
  innovation_score: number;
  copy_claim_warning: string;
  top_similar_projects: SimilarProjectResponse[];
  idea_profile: {
    industry: string;
    technology_stack: string[];
    target_users: string[];
    problem_statement: string;
    possible_risks: string[];
    innovation_category: string;
  };
  resource_scan: {
    similar_patents: Array<Record<string, string | number>>;
    similar_research: Array<Record<string, string | number>>;
    similar_startups: Array<Record<string, string | number>>;
    related_technologies: Array<Record<string, string | number>>;
  };
  innovation_breakdown: Record<string, number>;
  suggestions: string[];
  judging_scores: Record<string, number>;
  startup_analysis: Record<string, string | number>;
  business_analysis?: {
    business_viability_score?: number;
    location_suitability?: number;
    competition_level?: number;
    demand_estimation?: number;
    profit_potential?: number;
    cost_estimation?: string;
    growth_potential?: number;
    expected_revenue?: string;
    initial_investment?: string;
    break_even_time?: string;
    break_even_time_months?: number;
    risk_level?: string;
    best_city_profile?: string;
    recommendation?: string;
    target_customer?: string;
    summary?: string;
  };
  future_impact: {
    market_potential: string;
    adoption_probability: number;
    social_impact: number;
    risk_level: string;
    timeline: Array<Record<string, string | number>>;
    outlook: string;
  };
  competitor_intelligence: {
    competition_level: string;
    competitors: Array<Record<string, string | number>>;
    market_positioning: string;
  };
  market_insights: {
    market_size_billion_usd: number;
    growth_forecast_cagr: number;
    best_countries_for_launch: string[];
    yearly_projection: Array<Record<string, string | number>>;
    summary: string;
  };
  idea_evolution: Array<Record<string, string | number | string[]>>;
  impact_simulations: Array<Record<string, string | number>>;
  pitch: Record<string, string>;
  recommended_stack: Record<string, string>;
  architecture: {
    nodes: Array<Record<string, string>>;
    edges: Array<Record<string, string>>;
  };
  radar_metrics: Record<string, number>;
  analyzed_for: string;
  external_intelligence?: IntegratedIdeaAnalysisResponse;
};

export type InvestorDecisionPayload = {
  ideaName: string;
  ideaDescription: string;
  ideaAnalysis?: IntegratedIdeaAnalysisResponse["ideaAnalysis"];
  similarityResults?: {
    similarityScore: number;
    closestMatches?: ExternalSimilarityMatch[];
  };
  marketData?: {
    market_size_billion_usd?: number;
    growth_forecast_cagr?: number;
    best_countries_for_launch?: string[];
    marketPotential?: string;
    adoptionProbability?: number;
    riskLevel?: string;
  };
  competitors?: Array<Record<string, string | number>> | GitHubRepositoryResult[];
  innovationScore?: number;
};

export type InvestorDecisionResponse = {
  investorScore: number;
  fundingProbability: number;
  riskLevel: string;
  marketPotential: string;
  recommendation: string;
  marketOpportunityScore: number;
  competitionScore: number;
  technologyFeasibilityScore: number;
  riskScore: number;
  innovationScore: number;
  strategicAnalysis: string[];
};

export type PitchSlide = {
  id: string;
  title: string;
  content: string;
};

export type GeneratePitchPayload = {
  ideaName: string;
  ideaDescription: string;
  analysis?: AnalyzeIdeaResponse;
  industry?: string;
  targetUsers?: string[];
  technologyStack?: string[];
  innovationCategory?: string;
  competitionLevel?: string;
  innovationScore?: number;
  suggestions?: string[];
  marketInsights?: AnalyzeIdeaResponse["market_insights"];
};

export type GeneratePitchResponse = {
  slides: PitchSlide[];
  generatedAt: string;
  provider: "groq" | "fallback";
  sourceFingerprint?: string;
};

export type NoveltyCheckPayload = {
  ideaName: string;
  ideaDescription: string;
  ideaAnalysis?: IntegratedIdeaAnalysisResponse["ideaAnalysis"];
  patents?: PatentSearchResult[];
  githubRepos?: GitHubRepositoryResult[];
  wikipediaResults?: WikipediaSearchResult[];
  similarityScore?: number;
};

export type NoveltyCheckResponse = {
  noveltyScore: number;
  noveltyLevel: "Common Idea" | "Moderately Innovative" | "Highly Innovative" | "Breakthrough Innovation";
  relatedPatents: PatentSearchResult[];
  relatedTechnologies: string[];
  similarityScore: number;
  patentOverlap: number;
  technologyOverlap: number;
  competitionDensity: number;
  patentOverlapPenalty: number;
  technologyOverlapPenalty: number;
  sourceFingerprint?: string;
};

export type CertificateRecord = {
  certificateId: string;
  ideaName: string;
  uniquenessScore: number;
  issueDate: string;
  userId: string;
  platformSignature: string;
};

export type GenerateCertificatePayload = {
  ideaName: string;
  uniquenessScore: number;
  userId: string;
};

export type GenerateCertificateResponse = CertificateRecord;

export type ExplainableAiResponse = {
  explanationTitle: string;
  bullets: string[];
  summary: string;
  provider: "groq" | "fallback";
};

export type IdeaCoachResponse = {
  enhancedIdeaVersion: string;
  futureVersion: string;
  startupScalableVersion: string;
  provider: "groq" | "fallback";
};

export type InnovationMapDatum = {
  country: string;
  countryName: string;
  count: number;
  patents: number;
  repositories: number;
  technologies: number;
  latitude: number;
  longitude: number;
};

export type InnovationMapResponse = {
  data: InnovationMapDatum[];
  sourceFingerprint?: string;
};

export type StoredAnalysisHistoryEntry = {
  id: string;
  ideaName: string;
  similarityScore: number;
  innovationScore: number;
  noveltyScore: number;
  investorScore: number;
  analysisDate: string;
};

export type SavedAnalysisReport = {
  id: string;
  ideaName: string;
  createdAt: string;
  format: "pdf" | "docx";
};

export type SuggestionResponse = {
  suggestions: string[];
};

export type SimilarityCheckResponse = {
  similarity_score: number;
  similarity_breakdown: Record<string, number>;
  top_similar_projects: SimilarProjectResponse[];
  matching_resources: Record<string, unknown>;
};

export type InnovationScoreResponse = {
  innovation_score: number;
  similarity_score: number;
  technology_novelty: number;
  market_uniqueness: number;
};

export type ResourceScanResponse = {
  idea_profile: AnalyzeIdeaResponse["idea_profile"];
  resource_scan: AnalyzeIdeaResponse["resource_scan"];
};

export type MarketPredictionResponse = {
  market_insights: AnalyzeIdeaResponse["market_insights"];
  competitor_intelligence: AnalyzeIdeaResponse["competitor_intelligence"];
};

export type ImpactPredictionResponse = {
  future_impact: AnalyzeIdeaResponse["future_impact"];
  impact_simulations: AnalyzeIdeaResponse["impact_simulations"];
  idea_evolution: AnalyzeIdeaResponse["idea_evolution"];
};

export type IdeaGraphNodeType = "idea" | "technology" | "startup" | "research" | "industry" | "product";

export type IdeaGraphNode = {
  id: string;
  label: string;
  type: IdeaGraphNodeType;
  description: string;
};

export type IdeaGraphEdge = {
  source: string;
  target: string;
  weight: number;
  label: string;
};

export type IdeaGraphResponse = {
  nodes: IdeaGraphNode[];
  edges: IdeaGraphEdge[];
  summary: {
    idea: string;
    technology_count: number;
    startup_count: number;
    research_count: number;
    industry_count: number;
    product_count: number;
  };
};

export type IdeaVersionResponse = {
  id: number;
  version_number: number;
  description: string;
  innovation_score: number;
  created_at: string;
};

export type IdeaResponse = {
  id: number;
  title: string;
  description: string;
  mode: PlatformMode;
  is_public: boolean;
  innovation_score: number;
  latest_similarity_score: number;
  team_id?: string | null;
  team?: TeamSummaryResponse | null;
  created_at: string;
  updated_at: string;
  versions: IdeaVersionResponse[];
  result?: AnalyzeIdeaResponse | null;
};

export type TeamMemberResponse = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: "leader" | "member";
  created_at: string;
};

export type TeamSummaryResponse = {
  id: string;
  name: string;
  code: string;
  leader_id: string;
  role: "leader" | "member";
  created_at: string;
  member_count: number;
  members: TeamMemberResponse[];
  ideas: IdeaResponse[];
};

export type TeamActionResponse = {
  success: boolean;
  team: TeamSummaryResponse;
};

export type TeamMessageResponse = {
  id: string;
  content: string;
  user_id: string;
  full_name: string;
  created_at: string;
};

export type NotificationResponse = {
  id: string;
  text: string;
  type: string;
  read: boolean;
  team_id?: string | null;
  idea_id?: number | null;
  created_at: string;
};

export type ActivityLogResponse = {
  id: string;
  user_id: string;
  full_name: string;
  action: string;
  detail: string;
  created_at: string;
  team_id?: string | null;
  idea_id?: number | null;
};

export type TeamRealtimeSnapshotResponse = {
  team: TeamSummaryResponse;
  messages: TeamMessageResponse[];
  activity: ActivityLogResponse[];
};

export type PublicIdeaResponse = {
  title: string;
  description: string;
  mode: PlatformMode;
  source: string;
  innovation_score: number;
  similarity_score: number;
};

export type TeamWorkspaceResponse = {
  team_name: string;
  members: Array<Record<string, string | number>>;
  notes: Array<Record<string, string | number>>;
};

export type AnalysisResultResponse = {
  id: number;
  idea_id: number;
  innovation_score: number;
  similarity_score: number;
  technology_readiness: number;
  market_potential: number;
  ai_summary?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  innovation_highlights: string[];
  created_at: string;
};

export type AnalysisResultCreatePayload = {
  idea_id: number;
  innovation_score: number;
  similarity_score: number;
  technology_readiness?: number;
  market_potential?: number;
  ai_summary?: string;
  problem_statement?: string;
  proposed_solution?: string;
  innovation_highlights?: string[];
};

export type HelpChatPayload = {
  message: string;
};

export type HelpChatResponse = {
  answer: string;
  suggested_pages: string[];
};


