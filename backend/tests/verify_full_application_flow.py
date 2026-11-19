import sys
from pathlib import Path
import json

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database.db import Base, get_db
import database.models as models
from main import app

# In-memory DB setup
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
Base.metadata.create_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def run_e2e_verification():
    print("=== STARTING FULL APPLICATION WORKFLOW VERIFICATION ===")
    results = {}
    with TestClient(app) as client:
        # 1. Registration
        reg_payload = {
            "full_name": "Dr. Elena Rostova",
            "email": "elena@vortexinnovations.io",
            "password": "QuantumSecurePass2026!",
        }
        r_reg = client.post("/api/auth/register", json=reg_payload)
        assert r_reg.status_code in (200, 201), f"Registration failed: {r_reg.text}"
        user_data = r_reg.json()
        results["registration"] = {"status": "SUCCESS", "user_id": user_data["id"], "email": user_data["email"]}
        print(f"1. Registration: SUCCESS (User ID {user_data['id']})")

        # 2. Login
        login_payload = {"username": reg_payload["email"], "password": reg_payload["password"]}
        r_login = client.post("/api/auth/login", data=login_payload)
        assert r_login.status_code == 200, f"Login failed: {r_login.text}"
        token = r_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        results["login"] = {"status": "SUCCESS", "token_type": r_login.json()["token_type"]}
        print("2. Login & JWT Issuance: SUCCESS")

        # 3. Authenticated User Profile (/api/auth/me)
        r_me = client.get("/api/auth/me", headers=headers)
        assert r_me.status_code == 200
        assert r_me.json()["email"] == reg_payload["email"]
        results["auth_me"] = {"status": "SUCCESS"}
        print("3. Auth Session Verification (/api/auth/me): SUCCESS")

        # 4. Idea Analysis (/api/analyze-idea)
        analysis_payload = {
            "idea_name": "BioResonance Neural Audio",
            "idea_text": "Non-invasive neurofeedback headphone using auditory brainstem response to treat insomnia in real-time.",
            "mode": "business",
            "idea_type": "business",
        }
        r_ana = client.post("/api/analyze-idea", json=analysis_payload, headers=headers)
        assert r_ana.status_code == 200, f"Analysis failed: {r_ana.text}"
        analysis_data = r_ana.json()
        assert "innovation_score" in analysis_data
        assert "similarity_score" in analysis_data
        assert len(analysis_data["top_similar_projects"]) > 0
        results["idea_analysis"] = {
            "status": "SUCCESS",
            "innovation_score": analysis_data["innovation_score"],
            "similarity_score": analysis_data["similarity_score"],
            "top_match": analysis_data["top_similar_projects"][0]["title"],
        }
        print(f"4. AI Idea Analysis: SUCCESS (Score: {analysis_data['innovation_score']}, Top Match: {analysis_data['top_similar_projects'][0]['title']})")

        # 5. Idea Submission / Registration (/api/ideas)
        idea_reg_payload = {
            "idea_name": analysis_payload["idea_name"],
            "description": analysis_payload["idea_text"],
            "mode": "business",
            "is_public": True,
        }
        r_idea = client.post("/api/ideas", json=idea_reg_payload, headers=headers)
        assert r_idea.status_code in (200, 201), f"Idea submission failed: {r_idea.text}"
        registered_idea = r_idea.json()
        idea_id = registered_idea["id"]
        results["idea_registration"] = {"status": "SUCCESS", "idea_id": idea_id, "title": registered_idea["title"]}
        print(f"5. Idea Registration: SUCCESS (Idea ID: {idea_id})")

        # 6. Analysis History & Persistence (/api/ideas/{id})
        r_history = client.get(f"/api/ideas/{idea_id}", headers=headers)
        assert r_history.status_code == 200
        assert r_history.json()["title"] == analysis_payload["idea_name"]
        results["idea_persistence"] = {"status": "SUCCESS", "persisted_title": r_history.json()["title"]}
        print("6. Idea Retrieval & State Persistence: SUCCESS")

        # 7. Similarity Search (/api/similarity-ideas or /api/similar-ideas)
        r_sim = client.get("/api/similar-ideas?query=neurofeedback+brainstem+audio&mode=business", headers=headers)
        assert r_sim.status_code == 200
        similar_items = r_sim.json()
        assert len(similar_items) > 0
        results["similarity_search"] = {"status": "SUCCESS", "count": len(similar_items)}
        print(f"7. Semantic Similarity Search: SUCCESS ({len(similar_items)} items retrieved)")

        # 8. Certificate Generation (/api/ideas/{id}/certificate)
        r_cert = client.get(f"/api/ideas/{idea_id}/certificate", headers=headers)
        assert r_cert.status_code == 200
        assert r_cert.headers["content-type"] == "application/pdf"
        assert len(r_cert.content) > 500
        results["certificate"] = {"status": "SUCCESS", "pdf_bytes": len(r_cert.content)}
        print(f"8. Certificate PDF Generation: SUCCESS ({len(r_cert.content)} bytes generated)")

        # 9. Team Creation (/api/team/create)
        r_team = client.post("/api/team/create", json={"name": "Vortex BioTech Core"}, headers=headers)
        assert r_team.status_code in (200, 201)
        team_obj = r_team.json()["team"]
        team_id = team_obj["id"]
        invite_code = team_obj["code"]
        results["team_create"] = {"status": "SUCCESS", "team_id": team_id, "code": invite_code}
        print(f"9. Team Creation: SUCCESS (Team ID: {team_id}, Code: {invite_code})")

        # 10. Secondary User Team Join & Messaging
        reg2 = client.post("/api/auth/register", json={
            "full_name": "Marcus Vance",
            "email": "marcus@vortexinnovations.io",
            "password": "PartnerPass2026!",
        })
        token2 = client.post("/api/auth/login", data={"username": "marcus@vortexinnovations.io", "password": "PartnerPass2026!"}).json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        r_join = client.post("/api/team/join", json={"code": invite_code}, headers=headers2)
        assert r_join.status_code in (200, 201)
        print("10. Secondary User Team Join: SUCCESS")

        # 11. Team Messaging (/api/team/{id}/messages)
        msg_payload = {"content": "Initial neurofeedback prototype schematics uploaded to shared workspace."}
        r_msg = client.post(f"/api/team/{team_id}/messages", json=msg_payload, headers=headers2)
        assert r_msg.status_code in (200, 201)
        r_get_msgs = client.get(f"/api/team/{team_id}/messages", headers=headers)
        assert r_get_msgs.status_code == 200
        assert any(m["content"] == msg_payload["content"] for m in r_get_msgs.json())
        results["team_messaging"] = {"status": "SUCCESS", "messages_retrieved": len(r_get_msgs.json())}
        print(f"11. Team Workspace Messaging: SUCCESS ({len(r_get_msgs.json())} messages in history)")

        # 12. Notifications (/api/notifications)
        r_notif = client.get("/api/notifications", headers=headers)
        assert r_notif.status_code == 200
        results["notifications"] = {"status": "SUCCESS", "count": len(r_notif.json())}
        print(f"12. Notification Center API: SUCCESS ({len(r_notif.json())} notifications)")

    print("=== ALL 12 WORKFLOW STEPS VERIFIED WITH ZERO ERRORS ===")
    return results

if __name__ == "__main__":
    res = run_e2e_verification()
    print("OUTPUT_JSON:" + json.dumps(res))
