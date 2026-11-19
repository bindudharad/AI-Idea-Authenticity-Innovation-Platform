from fastapi.testclient import TestClient
from utils.security import decode_access_token


def test_user_registration_success(client: TestClient):
    payload = {
        "full_name": "Charlie Chaplin",
        "email": "charlie@example.com",
        "password": "StrongPassword99!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in (200, 201), response.text
    data = response.json()
    assert data["email"] == "charlie@example.com"
    assert data["full_name"] == "Charlie Chaplin"
    assert "id" in data
    assert "hashed_password" not in data


def test_user_registration_duplicate_email(client: TestClient, test_user_a):
    payload = {
        "full_name": "Alice Imposter",
        "email": test_user_a.email,
        "password": "Password123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.text.lower()


def test_login_success_and_jwt_claims(client: TestClient, test_user_a):
    payload = {
        "username": test_user_a.email,
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", data=payload)
    assert response.status_code == 200, response.text
    tokens = response.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"

    # Decode and verify token claims (sub, userId, exp)
    claims = decode_access_token(tokens["access_token"])
    assert claims is not None
    assert claims.get("sub") == str(test_user_a.id)
    assert claims.get("userId") == str(test_user_a.id)
    assert claims.get("email") == test_user_a.email
    assert "exp" in claims


def test_login_wrong_password(client: TestClient, test_user_a):
    payload = {
        "username": test_user_a.email,
        "password": "IncorrectPassword!",
    }
    response = client.post("/api/auth/login", data=payload)
    assert response.status_code == 401


def test_get_current_user_me(client: TestClient, auth_headers_a, test_user_a):
    response = client.get("/api/auth/me", headers=auth_headers_a)
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == test_user_a.email
    assert user_data["full_name"] == test_user_a.full_name


def test_get_current_user_unauthorized(client: TestClient):
    response = client.get("/api/auth/me")
    assert response.status_code in (401, 403)
