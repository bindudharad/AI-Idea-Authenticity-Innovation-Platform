import json
from datetime import datetime
from pathlib import Path


import json
from datetime import datetime
from pathlib import Path

def utcnow() -> datetime:
    """Return a UTC timestamp compatible with standard SQLAlchemy DateTime columns."""
    return datetime.utcnow()


def generate_sample_ideas(total: int = 250) -> list[dict]:
    """Return realistic, diverse startup and hackathon concepts across AI, HealthTech, FinTech, and CleanTech."""
    dataset_file = Path(__file__).resolve().parent.parent / "dataset" / "ideas.json"
    if dataset_file.exists():
        try:
            records = json.loads(dataset_file.read_text(encoding="utf-8"))
            if len(records) >= total:
                return records[:total]
            return records
        except Exception:
            pass

    # Fallback to importing generator if file not yet written
    from scripts.generate_rich_dataset import build_full_dataset
    records = build_full_dataset()
    return records[:total]


def ensure_dataset_exists(path: Path) -> None:
    """Create the JSON dataset if it has not been generated yet."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.stat().st_size > 100:
        return
    path.write_text(json.dumps(generate_sample_ideas(), indent=2), encoding="utf-8")
