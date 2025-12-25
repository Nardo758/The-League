import pytest
from fastapi.testclient import TestClient


def test_register_user(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "Password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data
    assert "hashed_password" not in data


def test_register_weak_password(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "weak",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 400
    assert "Password must be at least 8 characters" in response.json()["detail"]


def test_register_password_no_uppercase(client: TestClient):
    response = client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 400
    assert "uppercase" in response.json()["detail"]


def test_register_duplicate_email(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "Password123",
            "full_name": "First User"
        }
    )
    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "Password456",
            "full_name": "Second User"
        }
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "Password123",
            "full_name": "Login User"
        }
    )
    response = client.post(
        "/auth/token",
        data={
            "username": "login@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "email": "wrongpass@example.com",
            "password": "Password123",
            "full_name": "Test User"
        }
    )
    response = client.post(
        "/auth/token",
        data={
            "username": "wrongpass@example.com",
            "password": "WrongPassword123"
        }
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client: TestClient):
    response = client.post(
        "/auth/token",
        data={
            "username": "nonexistent@example.com",
            "password": "Password123"
        }
    )
    assert response.status_code == 401


def test_get_current_user(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "email": "me@example.com",
            "password": "Password123",
            "full_name": "Me User"
        }
    )
    login_response = client.post(
        "/auth/token",
        data={
            "username": "me@example.com",
            "password": "Password123"
        }
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"


def test_get_current_user_no_token(client: TestClient):
    response = client.get("/users/me")
    assert response.status_code == 401
