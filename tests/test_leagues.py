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


def create_sport(client: TestClient, headers: dict, name: str = "Test Sport"):
    response = client.post(
        "/sports",
        json={
            "name": name,
            "category": "golf",
            "scoring_type": "stroke_play",
            "team_based": False
        },
        headers=headers
    )
    return response.json()


def create_venue(client: TestClient, headers: dict, name: str = "Test Venue"):
    response = client.post(
        "/venues",
        json={
            "name": name,
            "description": "Test Description",
            "venue_type": "golf_course",
            "city": "Phoenix",
            "state": "AZ"
        },
        headers=headers
    )
    return response.json()


def test_create_venue(client: TestClient):
    headers = get_auth_header(client)
    response = client.post(
        "/venues",
        json={"name": "Test Venue", "description": "Test Description", "venue_type": "golf_course"},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Venue"
    assert "id" in data


def test_get_venues(client: TestClient):
    headers = get_auth_header(client)
    client.post(
        "/venues",
        json={"name": "Venue 1", "venue_type": "golf_course"},
        headers=headers
    )
    client.post(
        "/venues",
        json={"name": "Venue 2", "venue_type": "bowling_alley"},
        headers=headers
    )

    response = client.get("/venues", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert len(data["items"]) >= 2


def test_get_venues_pagination(client: TestClient):
    headers = get_auth_header(client)
    for i in range(5):
        client.post(
            "/venues",
            json={"name": f"Pagination Venue {i}", "venue_type": "golf_course"},
            headers=headers
        )

    response = client.get("/venues?page=1&page_size=2", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total"] >= 5


def test_create_sport(client: TestClient):
    headers = get_auth_header(client)
    response = client.post(
        "/sports",
        json={
            "name": "Golf",
            "category": "golf",
            "scoring_type": "stroke_play",
            "team_based": False
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Golf"
    assert data["category"] == "golf"


def test_create_league(client: TestClient):
    headers = get_auth_header(client)
    venue = create_venue(client, headers, "League Test Venue")
    sport = create_sport(client, headers, "League Sport")

    response = client.post(
        "/leagues",
        json={
            "name": "Test League",
            "venue_id": venue["id"],
            "sport_id": sport["id"],
            "registration_mode": "open"
        },
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test League"
    assert data["venue_id"] == venue["id"]
    assert data["sport_id"] == sport["id"]


def test_get_leagues(client: TestClient):
    headers = get_auth_header(client)
    venue = create_venue(client, headers, "Multi League Venue")
    sport = create_sport(client, headers, "Multi Sport")

    client.post(
        "/leagues",
        json={"name": "League A", "venue_id": venue["id"], "sport_id": sport["id"]},
        headers=headers
    )
    client.post(
        "/leagues",
        json={"name": "League B", "venue_id": venue["id"], "sport_id": sport["id"]},
        headers=headers
    )

    response = client.get("/leagues", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 2


def test_create_team(client: TestClient):
    headers = get_auth_header(client)
    venue = create_venue(client, headers, "Team Test Venue")
    sport = create_sport(client, headers, "Team Sport")

    league_response = client.post(
        "/leagues",
        json={"name": "Team Test League", "venue_id": venue["id"], "sport_id": sport["id"]},
        headers=headers
    )
    league_id = league_response.json()["id"]

    response = client.post(
        "/teams",
        json={"name": "Test Team", "city": "Test City", "league_id": league_id},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Team"
    assert data["city"] == "Test City"


def test_update_league_partial(client: TestClient):
    headers = get_auth_header(client)
    venue = create_venue(client, headers, "Update League Venue")
    sport = create_sport(client, headers, "Update Sport")

    league_response = client.post(
        "/leagues",
        json={"name": "Original Name", "venue_id": venue["id"], "sport_id": sport["id"]},
        headers=headers
    )
    league_id = league_response.json()["id"]

    response = client.patch(
        f"/leagues/{league_id}",
        json={"name": "Updated Name"},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"


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
