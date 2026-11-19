from fastapi.testclient import TestClient


def test_team_create_and_join_flow(client: TestClient, auth_headers_a, auth_headers_b):
    # User A creates a team
    create_res = client.post("/api/team/create", json={"name": "Alpha Builders"}, headers=auth_headers_a)
    assert create_res.status_code in (200, 201), create_res.text
    res_body = create_res.json()
    team_data = res_body["team"] if "team" in res_body else res_body
    assert team_data["name"] == "Alpha Builders"
    assert "code" in team_data
    invite_code = team_data["code"]
    team_id = team_data["id"]

    # User B joins the team with invite code
    join_res = client.post("/api/team/join", json={"code": invite_code}, headers=auth_headers_b)
    assert join_res.status_code in (200, 201), join_res.text
    join_body = join_res.json()
    joined_data = join_body["team"] if "team" in join_body else join_body
    assert joined_data["id"] == team_id

    # User B sends a team message
    msg_payload = {"content": "Hello team, let's build something innovative!"}
    msg_res = client.post(f"/api/team/{team_id}/messages", json=msg_payload, headers=auth_headers_b)
    assert msg_res.status_code in (200, 201), msg_res.text
    msg_data = msg_res.json()
    assert msg_data["content"] == msg_payload["content"]

    # User A reads team messages
    get_msgs_res = client.get(f"/api/team/{team_id}/messages", headers=auth_headers_a)
    assert get_msgs_res.status_code == 200
    messages = get_msgs_res.json()
    assert len(messages) >= 1
    assert any(m["content"] == msg_payload["content"] for m in messages)

    # User A shares an idea with the team
    idea_payload = {
        "idea_name": "Team Collab Tool",
        "description": "Collaborative brainstorming canvas for distributed engineering teams.",
        "mode": "hackathon",
        "team_id": team_id,
    }
    idea_res = client.post("/api/ideas", json=idea_payload, headers=auth_headers_a)
    assert idea_res.status_code in (200, 201)
    created_idea_id = idea_res.json()["id"]

    # User B can view team shared idea
    team_ideas_res = client.get(f"/api/team/{team_id}/ideas", headers=auth_headers_b)
    assert team_ideas_res.status_code == 200
    team_ideas = team_ideas_res.json()
    assert any(i["id"] == created_idea_id for i in team_ideas)


def test_non_member_cannot_access_team(client: TestClient, auth_headers_a, auth_headers_b):
    # User A creates a team
    create_res = client.post("/api/team/create", json={"name": "Secret Squad"}, headers=auth_headers_a)
    assert create_res.status_code in (200, 201)
    res_body = create_res.json()
    team_id = res_body["team"]["id"] if "team" in res_body else res_body["id"]

    # User B (who did not join) tries to access team messages
    msgs_res = client.get(f"/api/team/{team_id}/messages", headers=auth_headers_b)
    assert msgs_res.status_code in (403, 404)
