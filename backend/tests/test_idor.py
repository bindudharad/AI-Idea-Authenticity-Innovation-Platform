from fastapi.testclient import TestClient


def test_idor_cannot_read_private_idea_of_another_user(client: TestClient, auth_headers_a, auth_headers_b):
    # User A creates a private idea
    create_payload = {
        "idea_name": "Alice Stealth Venture",
        "description": "Proprietary zero-knowledge proof algorithm for private medical data transfer.",
        "mode": "business",
        "is_public": False,
    }
    create_res = client.post("/api/ideas", json=create_payload, headers=auth_headers_a)
    assert create_res.status_code in (200, 201), create_res.text
    idea_id = create_res.json()["id"]

    # User A can read their own idea
    get_res_a = client.get(f"/api/ideas/{idea_id}", headers=auth_headers_a)
    assert get_res_a.status_code == 200
    assert get_res_a.json()["title"] == "Alice Stealth Venture"

    # User B attempts to read User A's private idea (IDOR attack) -> must be rejected
    get_res_b = client.get(f"/api/ideas/{idea_id}", headers=auth_headers_b)
    assert get_res_b.status_code in (403, 404), f"Expected 403/404, got {get_res_b.status_code}"


def test_idor_cannot_modify_idea_of_another_user(client: TestClient, auth_headers_a, auth_headers_b):
    create_payload = {
        "idea_name": "Alice Private Project",
        "description": "Secure distributed telemetry pipeline with end-to-end cryptographic integrity.",
        "mode": "hackathon",
        "is_public": False,
    }
    create_res = client.post("/api/ideas", json=create_payload, headers=auth_headers_a)
    assert create_res.status_code in (200, 201)
    idea_id = create_res.json()["id"]

    # User B attempts to update User A's idea -> must be rejected
    update_payload = {"description": "Malicious takeover attempt of description."}
    update_res_b = client.put(f"/api/ideas/{idea_id}", json=update_payload, headers=auth_headers_b)
    assert update_res_b.status_code in (403, 404), f"Expected 403/404, got {update_res_b.status_code}"


def test_idor_cannot_inject_or_read_analysis_of_another_user(client: TestClient, auth_headers_a, auth_headers_b):
    create_payload = {
        "idea_name": "Alice Encrypted Store",
        "description": "Autonomous encrypted cold-storage management for decentralized clinical records.",
        "mode": "business",
        "is_public": False,
    }
    create_res = client.post("/api/ideas", json=create_payload, headers=auth_headers_a)
    assert create_res.status_code in (200, 201)
    idea_id = create_res.json()["id"]

    # User B attempts to post analysis results to User A's idea -> must be rejected
    analysis_payload = {
        "similarity_score": 95.0,
        "innovation_score": 5.0,
        "copy_claim_warning": "Attacker injected fake warning",
    }
    analysis_res_b = client.post(
        f"/api/ideas/{idea_id}/analysis-results",
        json=analysis_payload,
        headers=auth_headers_b,
    )
    assert analysis_res_b.status_code in (403, 404), f"Expected 403/404, got {analysis_res_b.status_code}"

    # User B attempts to query analysis results of User A's idea -> must be rejected
    get_analysis_b = client.get(
        f"/api/ideas/{idea_id}/analysis-results",
        headers=auth_headers_b,
    )
    assert get_analysis_b.status_code in (403, 404), f"Expected 403/404, got {get_analysis_b.status_code}"


def test_public_idea_accessible_to_others(client: TestClient, auth_headers_a, auth_headers_b):
    create_payload = {
        "idea_name": "Alice Open Source Tool",
        "description": "Public developer tooling for visualizing microservice network topologies.",
        "mode": "hackathon",
        "is_public": True,
    }
    create_res = client.post("/api/ideas", json=create_payload, headers=auth_headers_a)
    assert create_res.status_code in (200, 201)
    idea_id = create_res.json()["id"]

    # User B CAN read public ideas
    get_res_b = client.get(f"/api/ideas/{idea_id}", headers=auth_headers_b)
    assert get_res_b.status_code == 200
    assert get_res_b.json()["title"] == "Alice Open Source Tool"
