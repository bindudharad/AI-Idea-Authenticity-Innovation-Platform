import json
from pathlib import Path

from config import settings
from utils.helpers import generate_sample_ideas


def main() -> None:
    """Generate a 1000-record example dataset for local development and demos."""
    output_path = Path(settings.dataset_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(generate_sample_ideas(1000), indent=2), encoding="utf-8")
    print(f"Dataset written to {output_path}")


if __name__ == "__main__":
    main()
