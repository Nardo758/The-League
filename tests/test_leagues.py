import pytest
from fastapi.testclient import TestClient


def get_auth_header(client: TestClient, email: str = "testuser@example.com"):
    client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "Password123",
            "full_name": "Test User"
        }
    )
    response = client.post(
        "/auth/token",
        data={"username": email, "password": "Password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_organization(client: TestClient):
    headers = get_auth_header(client)
    response = client.post(
        "/orgs/",
        json={"name": "Test Org", "description": "Test Description"},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Org"
    assert "id" in data


def test_get_organizations(client: TestClient):
    headers = get_auth_header(client)
    client.post(
        "/orgs/",
        json={"name": "Org 1"},
        headers=headers
    )
    client.post(
        "/orgs/",
        json={"name": "Org 2"},
        headers=headers
    )

    response = client.get("/orgs/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_create_league(client: TestClient):
    headers = get_auth_header(client)
    org_response = client.post(
        "/orgs/",
        json={"name": "League Test Org"},
        headers=headers
    )
    org_id = org_response.json()["id"]

    response = client.post(
        "/leagues/",
        json={
            "name": "Test League",
            "sport": "Basketball",
            "season": "2024",
            "org_id": org_id
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test League"
    assert data["sport"] == "Basketball"
    assert data["org_id"] == org_id


def test_get_leagues(client: TestClient):
    headers = get_auth_header(client)
    org_response = client.post(
        "/orgs/",
        json={"name": "Multi League Org"},
        headers=headers
    )
    org_id = org_response.json()["id"]

    client.post(
        "/leagues/",
        json={"name": "League A", "org_id": org_id},
        headers=headers
    )
    client.post(
        "/leagues/",
        json={"name": "League B", "org_id": org_id},
        headers=headers
    )

    response = client.get("/leagues/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_create_team(client: TestClient):
    headers = get_auth_header(client)
    org_response = client.post(
        "/orgs/",
        json={"name": "Team Test Org"},
        headers=headers
    )
    org_id = org_response.json()["id"]

    league_response = client.post(
        "/leagues/",
        json={"name": "Team Test League", "org_id": org_id},
        headers=headers
    )
    league_id = league_response.json()["id"]

    response = client.post(
        "/teams/",
        json={"name": "Test Team", "city": "Test City", "league_id": league_id},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Team"
    assert data["city"] == "Test City"


def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_ai_policy_endpoint(client: TestClient):
    response = client.get("/ai/policy")
    assert response.status_code == 200
    data = response.json()
    assert "data_sent" in data
    assert "data_never_sent" in data
    assert "policy_version" in data
