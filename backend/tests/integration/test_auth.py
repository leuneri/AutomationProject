import httpx
import pytest
import uuid

BASE_URL = "http://localhost:4000"

@pytest.fixture
def unique_email():
    return f"test_{uuid.uuid4()}@test.com"

@pytest.fixture
def registered_user(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 201
    return response.json()

@pytest.fixture
def auth_token(registered_user):
    return registered_user["token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


# Test registration
def test_register_returns_201(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 201

def test_register_returns_token(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert "token" in response.json()
