import json
from pathlib import Path

from config import settings
from utils.helpers import generate_sample_ideas
from services.similarity_service import SimilarityService


def main() -> None:
    """Generate reference dataset and pre-index vectors in FAISS for fast runtime retrieval."""
    output_path = Path(settings.dataset_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    ideas = generate_sample_ideas()
    output_path.write_text(json.dumps(ideas, indent=2), encoding="utf-8")
    print(f"Dataset written to {output_path} ({len(ideas)} records)")

    print("Pre-building FAISS vector index...")
    service = SimilarityService()
    service.engine.ensure_indexed(ideas, service.embedding_model)
    print(f"FAISS index built and saved to {settings.faiss_index_path}")


if __name__ == "__main__":
    main()
