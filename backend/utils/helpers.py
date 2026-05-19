import json
from datetime import datetime
from pathlib import Path


TOPICS = [
    ("AI", "predictive analytics"),
    ("IoT", "sensor-driven automation"),
    ("Blockchain", "verifiable transaction flows"),
    ("Robotics", "autonomous operations"),
    ("HealthTech", "patient engagement"),
    ("EdTech", "adaptive learning"),
    ("FinTech", "risk intelligence"),
    ("ClimateTech", "sustainability tracking"),
]

AUDIENCES = ["students", "startup founders", "researchers", "enterprises", "hackathon teams"]
FORMATS = ["platform", "assistant", "dashboard", "marketplace", "workspace"]


def utcnow() -> datetime:
    """Return a UTC timestamp compatible with standard SQLAlchemy DateTime columns."""
    return datetime.utcnow()


def generate_sample_ideas(total: int = 1000) -> list[dict]:
    """Create a realistic synthetic dataset spanning hackathon and business use cases."""
    records: list[dict] = []
    for index in range(total):
        topic, capability = TOPICS[index % len(TOPICS)]
        audience = AUDIENCES[index % len(AUDIENCES)]
        product_format = FORMATS[index % len(FORMATS)]
        mode = "hackathon" if index % 2 == 0 else "business"
        title = f"{topic} {product_format.title()} {index + 1}"
        description = (
            f"A {product_format} for {audience} that uses {topic.lower()} for {capability}, "
            f"collaboration workflows, analytics, and measurable outcome tracking."
        )
        source = (
            "GitHub Project"
            if index % 4 == 0
            else "Hackathon Submission"
            if index % 4 == 1
            else "Research Paper"
            if index % 4 == 2
            else "Startup Database"
        )
        tags = [topic.lower(), capability.replace(" ", "-"), product_format]
        records.append(
            {
                "title": title,
                "description": description,
                "mode": mode,
                "source": source,
                "tags": tags,
            }
        )
    return records


def ensure_dataset_exists(path: Path) -> None:
    """Create the JSON dataset if it has not been generated yet."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        return
    path.write_text(json.dumps(generate_sample_ideas(), indent=2), encoding="utf-8")
