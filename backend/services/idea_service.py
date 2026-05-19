import json
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy import desc, func, or_
from sqlalchemy.orm import Session

from config import settings
from database import models
from database.db import SessionLocal
from database.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    AnalyticsResponse,
    FullAnalysisRequest,
    FullAnalysisResponse,
    IdeaRegistrationRequest,
    IdeaResponse,
    IdeaUpdateRequest,
    SuggestionResponse,
    TeamNoteCreate,
    TeamWorkspaceResponse,
    UserCreate,
)
from services.certificate_service import CertificateService
from services.competitor_service import CompetitorService
from services.evolution_service import EvolutionService
from services.future_impact_service import FutureImpactService
from services.idea_analysis_engine import IdeaAnalysisEngine
from services.idea_graph_service import IdeaGraphService
from services.impact_simulation_service import ImpactSimulationService
from services.innovation_service import InnovationService
from services.judging_service import JudgingService
from services.market_prediction_service import MarketPredictionService
from services.ownership_service import OwnershipService
from services.pitch_service import PitchService
from services.resource_scanner_service import ResourceScannerService
from services.similarity_service import SimilarityService
from services.startup_service import StartupService
from services.suggestion_service import SuggestionService
from services.team_service import TeamService
from services.trend_service import TrendService
from utils.helpers import ensure_dataset_exists, utcnow
from utils.security import get_password_hash


class IdeaService:
    """Application service that orchestrates persistence, analysis, and collaboration flows."""

    def __init__(self, db: Session | None = None) -> None:
        self.db = db
        self.similarity_service = SimilarityService()
        self.idea_analysis_engine = IdeaAnalysisEngine()
        self.innovation_service = InnovationService()
        self.resource_scanner_service = ResourceScannerService()
        self.suggestion_service = SuggestionService()
        self.judging_service = JudgingService()
        self.startup_service = StartupService()
        self.future_impact_service = FutureImpactService()
        self.idea_graph_service = IdeaGraphService()
        self.competitor_service = CompetitorService()
        self.market_prediction_service = MarketPredictionService()
        self.evolution_service = EvolutionService()
        self.impact_simulation_service = ImpactSimulationService()
        self.pitch_service = PitchService()
        self.trend_service = TrendService()
        self.certificate_service = CertificateService()

    def _db(self) -> Session:
        if self.db is None:
            raise RuntimeError("Database session not available")
        return self.db

    def bootstrap_dataset(self) -> None:
        """Create the starter dataset and seed database-backed reference ideas one time."""
        ensure_dataset_exists(Path(settings.dataset_path))
        with SessionLocal() as db:
            count = db.query(func.count(models.ReferenceIdea.id)).scalar() or 0
            if count > 0:
                return

            dataset = json.loads(Path(settings.dataset_path).read_text(encoding="utf-8"))
            for item in dataset:
                db.add(
                    models.ReferenceIdea(
                        title=item["title"],
                        description=item["description"],
                        mode=item["mode"],
                        source=item["source"],
                        tags=item["tags"],
                    )
                )
            db.commit()

    def create_user(self, payload: UserCreate) -> models.User:
        """Register a user with email uniqueness validation."""
        db = self._db()
        existing = db.query(models.User).filter(models.User.email == payload.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user = models.User(
            full_name=payload.full_name,
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def authenticate_user(self, username_or_email: str) -> models.User | None:
        """Find a user by email or by exact full-name match for simple local login flows."""
        db = self._db()
        return (
            db.query(models.User)
            .filter(or_(models.User.email == username_or_email, models.User.full_name == username_or_email))
            .first()
        )

    def _reference_records(self) -> list[dict]:
        """Load both curated reference ideas and public registered ideas into a shared comparison format."""
        db = self._db()
        references = db.query(models.ReferenceIdea).all()
        public_ideas = db.query(models.Idea).filter(models.Idea.is_public.is_(True)).all()

        combined = [
            {
                "title": item.title,
                "description": item.description,
                "mode": item.mode,
                "source": item.source,
            }
            for item in references
        ]
        combined.extend(
            {
                "title": item.title,
                "description": item.description,
                "mode": item.mode,
                "source": "Community Submission",
            }
            for item in public_ideas
        )
        return combined

    def analyze_idea(self, payload: AnalysisRequest, current_user: models.User) -> AnalysisResponse:
        """Run the core pipeline: similarity, innovation, suggestions, judging, startup analysis, and architecture."""
        idea_type = self._normalize_idea_type(payload.idea_type or payload.mode)
        similarity_mode = self._similarity_mode(idea_type)
        idea_profile = self.idea_analysis_engine.analyze(payload.idea_text, similarity_mode)
        matches = self.similarity_service.search(
            query=payload.idea_text,
            records=self._reference_records(),
            limit=5,
            mode=similarity_mode,
        )
        top_similarity = matches[0].similarity_score if matches else 0.0
        innovation_score = self.innovation_service.calculate_innovation_score(top_similarity)
        warning = "Similar project already exists." if top_similarity > 70 else "Idea appears sufficiently differentiated."
        serialized_matches = [match.__dict__ for match in matches]
        resource_scan = self.resource_scanner_service.scan(idea_profile, serialized_matches, similarity_mode)
        suggestions = self.suggestion_service.generate(payload.idea_text, idea_profile)
        judging = self.judging_service.score(payload.idea_text, innovation_score)
        startup = self.startup_service.analyze(payload.idea_text, innovation_score)
        business = self._business_analysis(payload.idea_text, idea_profile, startup, top_similarity, innovation_score)
        innovation_breakdown = self.innovation_service.score_breakdown(top_similarity, idea_profile, startup)
        future_impact = self.future_impact_service.predict(idea_profile, innovation_score, startup)
        competitor_intelligence = self.competitor_service.analyze(serialized_matches, startup, similarity_mode)
        market_insights = self.market_prediction_service.predict(idea_profile, innovation_score)
        idea_evolution = self.evolution_service.roadmap(payload.idea_name, idea_profile, similarity_mode)
        impact_simulations = self.impact_simulation_service.simulate(innovation_score, market_insights)
        pitch = self.pitch_service.generate(payload.idea_name, idea_profile, market_insights, future_impact)
        radar = self.innovation_service.originality_breakdown(innovation_score)

        return AnalysisResponse(
            idea_name=payload.idea_name,
            mode=idea_type,
            idea_type=idea_type,
            similarity_score=top_similarity,
            innovation_score=innovation_score,
            copy_claim_warning=warning,
            top_similar_projects=serialized_matches,
            idea_profile=idea_profile,
            resource_scan=resource_scan,
            innovation_breakdown=innovation_breakdown,
            suggestions=suggestions,
            judging_scores=judging,
            startup_analysis=startup,
            business_analysis=business if idea_type == "business" else {},
            future_impact=future_impact,
            competitor_intelligence=competitor_intelligence,
            market_insights=market_insights,
            idea_evolution=idea_evolution,
            impact_simulations=impact_simulations,
            pitch=pitch,
            recommended_stack=self._recommended_stack(payload.idea_text),
            architecture=self.trend_service.architecture_graph(),
            radar_metrics=radar,
            analyzed_for=current_user.full_name,
        )

    def generate_suggestions(self, idea_text: str) -> SuggestionResponse:
        """Expose suggestions as a standalone route for frontend iterative refinement workflows."""
        return SuggestionResponse(suggestions=self.suggestion_service.generate(idea_text))

    def analyze_full(self, payload: FullAnalysisRequest, current_user: models.User) -> FullAnalysisResponse:
        """Return the complete business ecosystem analysis while reusing the canonical idea engine."""
        idea_type = self._normalize_idea_type(payload.idea_type)
        analysis = self.analyze_idea(
            AnalysisRequest(
                idea_name=payload.idea_name,
                idea_text=payload.idea,
                mode=idea_type,
                idea_type=idea_type,
            ),
            current_user,
        )
        business = analysis.business_analysis or self._business_analysis(
            payload.idea,
            analysis.idea_profile,
            analysis.startup_analysis,
            analysis.similarity_score,
            analysis.innovation_score,
        )
        location = self._ecosystem_location(payload.location, payload.idea, business)
        financial = self._ecosystem_financials(business, analysis.innovation_score)
        funding = self._ecosystem_funding(idea_type, financial, analysis, business)
        growth = self._ecosystem_growth(analysis, business)

        return FullAnalysisResponse(
            idea_engine={
                "idea_type": idea_type,
                "viability_score": business.get("business_viability_score", analysis.innovation_score),
                "innovation_score": analysis.innovation_score,
                "risk_level": business.get("risk_level", analysis.future_impact.get("risk_level", "Moderate")),
            },
            location_intelligence=location,
            competitor_engine={
                "nearby_competitors": self._mock_competitors(payload.idea, payload.location),
                "density_score": business.get("competition_level", round(analysis.similarity_score)),
                "market_saturation": "High" if float(business.get("competition_level", 50)) >= 75 else "Medium",
                "top_similar_projects": analysis.top_similar_projects,
            },
            financial_engine=financial,
            funding_engine=funding,
            business_blueprint={
                "step_by_step_plan": [
                    "Validate the core customer segment with 10-20 discovery conversations.",
                    "Launch a small MVP or pilot in the highest-scoring location/channel.",
                    "Track repeat demand, acquisition cost, and conversion before scaling.",
                    "Use the full Build Plan page for roadmap, stack, team, and operating details.",
                ],
                "team_requirements": ["Founder/operator", "Product or operations lead", "Marketing/growth owner", "Finance/admin support"],
                "tools_needed": ["Analytics dashboard", "CRM or lead tracker", "Payments/accounting stack", "Customer feedback system"],
            },
            growth_engine=growth,
            recommendation_ai={
                "best_action_to_take": business.get("recommendation", "Validate demand with a small controlled launch."),
                "avoid_this_mistake": "Do not over-invest before proving repeat demand and unit economics.",
                "next_step": "Open the most relevant detail page and turn the top insight into a 7-day execution task.",
            },
            source_analysis=analysis.model_dump(),
        )

    def generate_idea_graph(self, idea_name: str, idea_description: str, mode: str) -> dict:
        """Generate a graph representation of the idea and the related innovation ecosystem."""
        similarity_mode = self._similarity_mode(self._normalize_idea_type(mode))
        idea_profile = self.idea_analysis_engine.analyze(idea_description, similarity_mode)
        matches = self.similarity_service.search(
            query=idea_description,
            records=self._reference_records(),
            limit=5,
            mode=similarity_mode,
        )
        serialized_matches = [match.__dict__ for match in matches]
        resource_scan = self.resource_scanner_service.scan(idea_profile, serialized_matches, similarity_mode)
        return self.idea_graph_service.build_graph(
            idea_name=idea_name,
            idea_description=idea_description,
            idea_profile=idea_profile,
            resource_scan=resource_scan,
            similarity_matches=serialized_matches,
        )

    def register_idea(self, payload: IdeaRegistrationRequest, current_user: models.User) -> models.Idea:
        """Persist a private or public idea and create its first ownership snapshot."""
        db = self._db()
        idea_type = self._normalize_idea_type(payload.idea_type or payload.mode)
        analysis = self.analyze_idea(
            AnalysisRequest(idea_name=payload.idea_name, idea_text=payload.description, mode=idea_type, idea_type=idea_type),
            current_user,
        )
        idea = models.Idea(
            title=payload.idea_name,
            description=payload.description,
            mode=idea_type,
            owner_id=current_user.id,
            is_public=payload.is_public,
            innovation_score=analysis.innovation_score,
            latest_similarity_score=analysis.similarity_score,
            created_at=utcnow(),
        )
        db.add(idea)
        db.flush()

        OwnershipService(db).create_version(idea, payload.description, analysis.innovation_score)
        team = TeamService(db).ensure_team(idea)
        db.add(models.TeamMember(team_id=team.id, user_id=current_user.id, role="Owner"))
        db.commit()
        db.refresh(idea)
        return idea

    def update_idea(self, idea_id: int, payload: IdeaUpdateRequest, current_user: models.User) -> models.Idea:
        """Update an owned idea while preserving version history."""
        db = self._db()
        idea = self._owned_idea(idea_id, current_user.id)
        if payload.description:
            analysis = self.analyze_idea(
                AnalysisRequest(idea_name=idea.title, idea_text=payload.description, mode=idea.mode, idea_type=idea.mode),
                current_user,
            )
            idea.description = payload.description
            idea.innovation_score = analysis.innovation_score
            idea.latest_similarity_score = analysis.similarity_score
            OwnershipService(db).create_version(idea, payload.description, analysis.innovation_score)
        if payload.is_public is not None:
            idea.is_public = payload.is_public
        db.commit()
        db.refresh(idea)
        return idea

    def get_user_ideas(self, current_user: models.User) -> list[models.Idea]:
        """Return ideas owned by the current user ordered by most recent updates."""
        db = self._db()
        return (
            db.query(models.Idea)
            .filter(models.Idea.owner_id == current_user.id)
            .order_by(models.Idea.updated_at.desc())
            .all()
        )

    def get_idea(self, idea_id: int, current_user: models.User) -> models.Idea:
        """Return one owned idea for detail and version views."""
        return self._owned_idea(idea_id, current_user.id)

    def analyze_saved_idea(self, idea_id: int, current_user: models.User) -> AnalysisResponse:
        """Re-run the canonical backend analysis for a saved idea so module pages share one source of truth."""
        idea = self._owned_idea(idea_id, current_user.id)
        return self.analyze_idea(
            AnalysisRequest(
                idea_name=idea.title,
                idea_text=idea.description,
                mode=idea.mode,
                idea_type=idea.mode,
            ),
            current_user,
        )

    def find_similar_ideas(self, query: str, mode: str) -> list[dict]:
        """Search reference/public records and normalize the shape for response models."""
        similarity_mode = self._similarity_mode(self._normalize_idea_type(mode))
        matches = self.similarity_service.search(query=query, records=self._reference_records(), mode=similarity_mode)
        return [
            {
                "title": item.title,
                "description": item.description,
                "mode": item.mode,
                "source": item.source,
                "innovation_score": self.innovation_service.calculate_innovation_score(item.similarity_score),
                "similarity_score": item.similarity_score,
            }
            for item in matches
        ]

    def list_public_ideas(self, sort_by: str) -> list[models.Idea]:
        """Return public ideas sorted for the community explorer."""
        db = self._db()
        query = db.query(models.Idea).filter(models.Idea.is_public.is_(True))
        if sort_by == "recent":
            query = query.order_by(desc(models.Idea.created_at))
        elif sort_by == "popularity":
            query = query.order_by(desc(models.Idea.view_count), desc(models.Idea.innovation_score))
        else:
            query = query.order_by(desc(models.Idea.innovation_score), desc(models.Idea.created_at))
        return query.limit(25).all()

    def get_team_workspace(self, idea_id: int, current_user: models.User) -> TeamWorkspaceResponse:
        """Load the workspace if the user owns the idea or the idea is public."""
        idea = self._accessible_idea(idea_id, current_user.id)
        return TeamService(self._db()).workspace_response(idea)

    def add_team_note(self, idea_id: int, payload: TeamNoteCreate, current_user: models.User) -> TeamWorkspaceResponse:
        """Allow idea owners to append notes to their collaboration workspace."""
        idea = self._owned_idea(idea_id, current_user.id)
        return TeamService(self._db()).add_note(idea, payload, current_user.id)

    def generate_certificate(self, idea_id: int, current_user: models.User) -> Path:
        """Create a certificate file and record it in the database."""
        db = self._db()
        idea = self._owned_idea(idea_id, current_user.id)
        path = self.certificate_service.generate(
            idea_name=idea.title,
            owner=current_user.full_name,
            date_text=idea.created_at.strftime("%Y-%m-%d %H:%M UTC"),
            innovation_score=idea.innovation_score,
            similarity_score=idea.latest_similarity_score,
            timestamp_text=idea.updated_at.strftime("%Y-%m-%d %H:%M UTC"),
        )
        existing = db.query(models.Certificate).filter(models.Certificate.idea_id == idea.id).first()
        if existing:
            existing.file_path = str(path)
        else:
            db.add(models.Certificate(idea_id=idea.id, owner_id=current_user.id, file_path=str(path)))
        db.commit()
        return path

    def get_analytics(self, current_user: models.User) -> AnalyticsResponse:
        """Aggregate user metrics, trends, and community snapshots for the dashboard."""
        db = self._db()
        ideas = db.query(models.Idea).filter(models.Idea.owner_id == current_user.id).order_by(models.Idea.created_at).all()
        public_count = db.query(func.count(models.Idea.id)).filter(models.Idea.is_public.is_(True)).scalar() or 0
        average_innovation = round(sum(item.innovation_score for item in ideas) / len(ideas), 2) if ideas else 0.0
        latest_idea = ideas[-1] if ideas else None
        latest_radar = (
            self.innovation_service.originality_breakdown(latest_idea.innovation_score)
            if latest_idea
            else self.innovation_service.originality_breakdown(0)
        )
        return AnalyticsResponse(
            total_ideas=len(ideas),
            public_ideas=public_count,
            average_innovation_score=average_innovation,
            latest_similarity_score=latest_idea.latest_similarity_score if latest_idea else 0.0,
            radar_metrics=latest_radar,
            trend_analysis=self.trend_service.get_trends(),
            architecture=self.trend_service.architecture_graph(),
            recent_public_ideas=[
                {
                    "title": item.title,
                    "description": item.description,
                    "mode": item.mode,
                    "source": "Community Submission",
                    "innovation_score": item.innovation_score,
                    "similarity_score": item.latest_similarity_score,
                }
                for item in self.list_public_ideas("recent")[:5]
            ],
            market_summary={
                "focus_market": "United States",
                "readiness": "Strong" if average_innovation >= 60 else "Developing",
                "top_vertical": ideas[-1].mode.title() if ideas else "Innovation",
            },
            engine_status=[
                {"name": "Idea Analysis Engine", "status": "Active"},
                {"name": "Similarity Engine", "status": "Active"},
                {"name": "Resource Scanner Engine", "status": "Active"},
                {"name": "Impact & Market Engines", "status": "Active"},
            ],
        )

    def _recommended_stack(self, idea_text: str) -> dict[str, str]:
        """Generate a practical starter stack tailored to the idea's domain."""
        normalized = idea_text.lower()
        frontend = "Next.js 14 with TailwindCSS"
        backend = "FastAPI with JWT authentication"
        ai_model = "Sentence Transformers (all-MiniLM-L6-v2)"
        database = "PostgreSQL with FAISS vector index"
        if "mobile" in normalized:
            frontend = "Next.js 14 plus React Native companion app"
        if "iot" in normalized:
            backend = "FastAPI with MQTT/WebSocket integrations"
        return {
            "frontend": frontend,
            "backend": backend,
            "ai_model": ai_model,
            "database": database,
        }

    def _normalize_idea_type(self, value: str | None) -> str:
        """Keep old hackathon records working while exposing the product as startup/business."""
        normalized = (value or "startup").lower()
        if normalized == "business":
            return "business"
        return "startup"

    def _similarity_mode(self, idea_type: str) -> str:
        """Legacy reference data uses hackathon for startup-style concepts."""
        return "business" if idea_type == "business" else "hackathon"

    def _business_analysis(
        self,
        idea_text: str,
        idea_profile: dict,
        startup: dict[str, float | str],
        similarity_score: float,
        innovation_score: float,
    ) -> dict[str, object]:
        """Generate deterministic business-idea metrics without requiring paid market datasets."""
        normalized = idea_text.lower()
        local_intent = any(word in normalized for word in ["shop", "cafe", "restaurant", "clinic", "salon", "store", "local"])
        premium_intent = any(word in normalized for word in ["premium", "subscription", "enterprise", "luxury", "specialty"])
        demand_base = 76 if local_intent else 68
        demand_estimation = min(94, demand_base + (8 if premium_intent else 0) + int(innovation_score / 12))
        competition_level = min(92, max(22, int(similarity_score * 0.72) + (16 if local_intent else 8)))
        location_suitability = max(35, min(96, demand_estimation - int(competition_level * 0.28) + 14))
        profit_potential = max(28, min(96, demand_estimation - int(competition_level * 0.34) + (12 if premium_intent else 5)))
        growth_potential = max(30, min(95, int(innovation_score * 0.45) + int(demand_estimation * 0.42)))
        initial_investment = 18000 + (12000 if local_intent else 8000) + int(competition_level * 420)
        expected_revenue = int(initial_investment * (1.35 + profit_potential / 100))
        break_even_time_months = max(5, min(30, int(24 - profit_potential / 7 + competition_level / 11)))
        risk_level = "Low" if profit_potential >= 72 and competition_level < 55 else "High" if competition_level >= 75 else "Moderate"
        viability_score = round((location_suitability + demand_estimation + profit_potential + growth_potential + (100 - competition_level)) / 5, 2)

        return {
            "business_viability_score": viability_score,
            "location_suitability": location_suitability,
            "competition_level": competition_level,
            "demand_estimation": demand_estimation,
            "profit_potential": profit_potential,
            "cost_estimation": f"${initial_investment:,} initial setup",
            "growth_potential": growth_potential,
            "expected_revenue": f"${expected_revenue:,}/year",
            "initial_investment": f"${initial_investment:,}",
            "break_even_time": f"{break_even_time_months} months",
            "break_even_time_months": break_even_time_months,
            "risk_level": risk_level,
            "best_city_profile": "Dense residential/commercial zone with visible foot traffic and manageable nearby competition.",
            "recommendation": "Validate the top location zone first, test demand with a small launch, and avoid heavy fixed costs until repeat demand is proven.",
            "target_customer": ", ".join(idea_profile.get("target_users", [])[:3]) or "Local high-intent customers",
            "summary": "Business potential is strongest where demand density is high, competition is moderate, and setup costs stay controlled.",
        }

    def _ecosystem_location(self, location: dict, idea_text: str, business: dict[str, object]) -> dict[str, object]:
        """Generate compact location heatmap data for /analyze-full without depending on external APIs."""
        country = str(location.get("country") or "India")
        state = str(location.get("state") or "Karnataka")
        city = str(location.get("city") or "Bengaluru")
        seed = sum(ord(char) for char in f"{country}:{state}:{city}:{idea_text}")
        zones = []
        for index in range(12):
            demand = 48 + ((seed + index * 11) % 43)
            competition = 30 + ((seed + index * 17) % 55)
            score = max(0, min(100, 50 + int(demand * 0.62) - int(competition * 0.42)))
            zones.append(
                {
                    "name": f"Zone {index + 1}",
                    "profit_score": score,
                    "competition_level": competition,
                    "demand_estimate": demand,
                    "status": "high" if score >= 70 else "medium" if score >= 40 else "low",
                }
            )
        return {
            "country": country,
            "state": state,
            "city": city,
            "location_suitability": business.get("location_suitability", 70),
            "best_zones": [zone for zone in zones if zone["status"] == "high"][:4],
            "high_competition_zones": [zone for zone in zones if zone["status"] == "low"][:4],
            "zones": zones,
        }

    def _mock_competitors(self, idea_text: str, location: dict) -> list[dict[str, object]]:
        """Fallback competitor set for demos when Google Places is unavailable."""
        city = str(location.get("city") or "Selected city")
        keywords = [word.title() for word in idea_text.split()[:3] if len(word) > 3] or ["Local"]
        return [
            {"name": f"{keywords[0]} Hub {city}", "distance_km": 1.2, "rating": 4.2, "competition_strength": 72},
            {"name": f"{city} Business Studio", "distance_km": 2.8, "rating": 4.0, "competition_strength": 64},
            {"name": f"Premium {keywords[-1]} Point", "distance_km": 4.1, "rating": 3.9, "competition_strength": 58},
        ]

    def _ecosystem_financials(self, business: dict[str, object], innovation_score: float) -> dict[str, object]:
        investment_text = str(business.get("initial_investment", "$25,000")).replace("$", "").replace(",", "")
        try:
            initial_investment = int(float(investment_text))
        except ValueError:
            initial_investment = 25000
        profit_potential = float(business.get("profit_potential", 68))
        expected_revenue = int(initial_investment * (1.25 + profit_potential / 100))
        roi_estimate = round(((expected_revenue - initial_investment) / max(1, initial_investment)) * 100, 1)
        return {
            "initial_investment": f"${initial_investment:,}",
            "expected_revenue": business.get("expected_revenue", f"${expected_revenue:,}/year"),
            "break_even_time": business.get("break_even_time", "12-18 months"),
            "roi_estimate": f"{roi_estimate}%",
            "confidence_score": round((profit_potential + innovation_score) / 2, 2),
        }

    def _ecosystem_funding(self, idea_type: str, financial: dict[str, object], analysis: AnalysisResponse, business: dict[str, object]) -> dict[str, object]:
        score = float(business.get("business_viability_score", analysis.innovation_score))
        funding_type = "VC" if idea_type == "startup" and analysis.innovation_score >= 75 else "loan" if idea_type == "business" else "bootstrapping"
        return {
            "funding_type": funding_type,
            "investment_required": financial.get("initial_investment", "$25,000"),
            "pitch_readiness": round((score + analysis.innovation_score) / 2, 2),
            "recommendation": "Raise external capital only after proof of demand." if funding_type != "bootstrapping" else "Bootstrap until early traction is visible.",
        }

    def _ecosystem_growth(self, analysis: AnalysisResponse, business: dict[str, object]) -> dict[str, object]:
        scalability = float(business.get("growth_potential", analysis.startup_analysis.get("startup_potential_score", 65)))
        return {
            "growth_potential": business.get("growth_potential", round(scalability)),
            "scalability_score": round((scalability + analysis.innovation_score) / 2, 2),
            "expansion_strategy": "Expand city-by-city after unit economics and repeat demand are proven.",
            "next_markets": analysis.market_insights.get("best_countries_for_launch", [])[:3],
        }

    def _owned_idea(self, idea_id: int, owner_id: int) -> models.Idea:
        """Require direct ownership for mutation and certificate operations."""
        db = self._db()
        idea = db.query(models.Idea).filter(models.Idea.id == idea_id, models.Idea.owner_id == owner_id).first()
        if not idea:
            raise HTTPException(status_code=404, detail="Idea not found")
        return idea

    def _accessible_idea(self, idea_id: int, user_id: int) -> models.Idea:
        """Allow owners or public viewers to access an idea workspace."""
        db = self._db()
        idea = db.query(models.Idea).filter(models.Idea.id == idea_id).first()
        if not idea or (not idea.is_public and idea.owner_id != user_id):
            raise HTTPException(status_code=404, detail="Idea not found")
        return idea
