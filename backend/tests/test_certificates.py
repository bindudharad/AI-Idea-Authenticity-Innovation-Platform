from pathlib import Path
from fastapi.testclient import TestClient
from services.certificate_service import CertificateService


def test_certificate_generation_file_creation(tmp_path):
    service = CertificateService(output_dir=str(tmp_path))
    pdf_path = service.generate(
        idea_name="Quantum Neural Security",
        owner="Alice Founder",
        date_text="2026-11-01",
        innovation_score=88.5,
        similarity_score=15.2,
        idea_id=42,
        owner_id=1,
    )

    assert pdf_path.exists()
    assert pdf_path.is_file()
    assert pdf_path.suffix == ".pdf"
    assert pdf_path.stat().st_size > 500  # Non-trivial PDF output
    assert "cert_idea_42" in pdf_path.name


def test_certificate_filename_uniqueness_and_entropy(tmp_path):
    service = CertificateService(output_dir=str(tmp_path))
    # Two certificates for same idea name but different timestamps/owners
    path1 = service.generate(
        idea_name="Project Phoenix",
        owner="User One",
        date_text="2026-11-01",
        timestamp_text="2026-11-01 10:00:00",
        innovation_score=75.0,
        idea_id=101,
        owner_id=1,
    )
    path2 = service.generate(
        idea_name="Project Phoenix",
        owner="User Two",
        date_text="2026-11-01",
        timestamp_text="2026-11-01 10:05:00",
        innovation_score=75.0,
        idea_id=102,
        owner_id=2,
    )

    assert path1.name != path2.name
    assert path1.exists()
    assert path2.exists()


def test_certificate_api_endpoint(client: TestClient, auth_headers_a):
    # Register idea first
    create_payload = {
        "idea_name": "Autonomous Drone Fleet",
        "description": "Multi-agent autonomous drone coordination for agricultural crop monitoring.",
        "mode": "business",
    }
    idea_res = client.post("/api/ideas", json=create_payload, headers=auth_headers_a)
    assert idea_res.status_code in (200, 201)
    idea_id = idea_res.json()["id"]

    # Request certificate download
    cert_res = client.get(f"/api/ideas/{idea_id}/certificate", headers=auth_headers_a)
    assert cert_res.status_code == 200
    assert cert_res.headers["content-type"] == "application/pdf"
    assert len(cert_res.content) > 500
