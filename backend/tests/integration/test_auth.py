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


# Tests Register Endpoint
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
    assert response.status_code == 201
    assert "token" in response.json()

def test_register_returns_no_password(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 201
    assert "password" not in response.json()

def test_register_returns_name_and_role(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 201
    assert "name" in response.json()["user"]
    assert response.json()["user"]["name"] == "Test User"
    assert "role" in response.json()["user"]
    assert response.json()["user"]["role"] == "customer"

def test_register_no_email():
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 400

def test_register_no_password(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "name": "Test User"
    })
    assert response.status_code == 400

def test_register_no_name(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123"
    })
    assert response.status_code == 400

def test_register_invalid_email_format():
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": "fakeEmail.com",
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 400

def test_register_duplicate_email(unique_email):
    httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 409


# Tests Login Endpoint
def test_login_wrong_password(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401