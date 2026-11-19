import numpy as np
from ai.embedding_model import EmbeddingModel
from services.similarity_service import SimilarityService
from services.innovation_service import InnovationService
from services.judging_service import JudgingService
from services.resource_scanner_service import ResourceScannerService


def test_embedding_model_properties():
    model = EmbeddingModel()
    assert model.dimension == 384

    vec = model.encode("Autonomous drone for solar panel thermographic inspection")
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (384,)
    # Verify unit normalization: Euclidean norm of normalized vector is ~1.0
    norm = float(np.linalg.norm(vec))
    assert abs(norm - 1.0) < 1e-4


def test_semantic_similarity_vs_unrelated():
    model = EmbeddingModel()
    v1 = model.encode("Autonomous agricultural robot for weed removal using computer vision")
    v2 = model.encode("Robotic field rover that uses cameras to detect and spray agricultural weeds")
    v3 = model.encode("Cryptocurrency algorithmic high-frequency arbitrage trading bot")

    # Cosine similarity between normalized vectors is inner product
    sim_related = float(np.dot(v1, v2))
    sim_unrelated = float(np.dot(v1, v3))

    assert sim_related > 0.70, f"Expected high semantic similarity, got {sim_related}"
    assert sim_unrelated < 0.40, f"Expected low similarity for unrelated topics, got {sim_unrelated}"


def test_similarity_service_retrieval():
    service = SimilarityService()
    results = service.search("Deep learning for histological biopsy tumor detection", records=[], limit=3)
    assert len(results) > 0
    # Top result should semantically match the oncology / biopsy domain
    top_title = results[0].title.lower()
    assert any(term in top_title for term in ["onco", "biopsy", "pathology", "cancer", "medical"])
    assert results[0].similarity_score > 40.0


def test_innovation_service_multi_dimensional_scoring():
    # High similarity (e.g. 85%) with modest stack
    score_high_sim = InnovationService.calculate_innovation_score(85.0)

    # Low similarity (e.g. 20%) with rich stack
    profile = {
        "technology_stack": ["PyTorch", "eBPF", "WebAssembly", "FastAPI"],
        "key_features": ["Zero-copy parsing", "Autonomous anomaly detection", "Edge inferencing"],
    }
    startup = {"competition_level": "Low"}
    score_innovative = InnovationService.calculate_innovation_score(20.0, idea_profile=profile, startup_analysis=startup)

    assert score_innovative > score_high_sim
    assert score_innovative >= 80.0


def test_hackathon_judging_explainability():
    judging = JudgingService()
    profile = {
        "technology_stack": ["Rust", "PyTorch", "Kubernetes", "gRPC"],
        "key_features": ["Distributed consensus", "Sub-millisecond inference"],
    }
    startup = {"target_market": "Global enterprise infrastructure"}
    scores = judging.score(
        "Distributed machine learning execution framework for Kubernetes clusters",
        innovation_score=85.0,
        idea_profile=profile,
        startup_analysis=startup,
    )
    assert "innovation" in scores
    assert "technical_complexity" in scores
    assert "real_world_impact" in scores
    assert "feasibility" in scores
    assert "overall" in scores
    assert "feedback" in scores
    assert isinstance(scores["feedback"], list)
    assert len(scores["feedback"]) > 0


def test_resource_scanner_no_fake_patents():
    scanner = ResourceScannerService()
    idea_profile = {
        "industry": "Healthcare",
        "technology_stack": ["Computer Vision", "PyTorch"],
    }
    scan = scanner.scan(idea_profile, [], mode="business")
    assert "similar_patents" in scan
    assert "scan_metadata" in scan
    assert scan["scan_metadata"]["fabricated_records"] is False

    # Verify no fake 'US-XXXXXX' patent numbers are generated
    for p in scan["similar_patents"]:
        assert "patentNumber" not in p
        assert "patents.google.com" in p["link"]
