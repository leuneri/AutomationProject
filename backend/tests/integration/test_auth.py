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

def test_register_returns_token(registered_user):
    assert "token" in registered_user

def test_register_returns_no_password(registered_user):
    assert "password" not in registered_user # KEY
    assert "password" not in registered_user["user"]

def test_register_returns_user_data(unique_email, registered_user):
    body = registered_user

    assert set(body.keys()) == {"token", "user"}
    assert set(body["user"].keys()) == {
        "id",
        "email",
        "name",
        "role"
    }
    assert body["user"]["name"] == "Test User"
    assert body["user"]["role"] == "customer"
    assert body["user"]["email"] == unique_email # KEY

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

def test_register_duplicate_email(registered_user, unique_email): # registered_user fixture ensures the email is already registered
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 409
    assert "token" not in response.json() # KEY

def test_register_empty_email():
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": "", # KEY
        "password": "password123",
        "name": "Test User"
    })
    assert response.status_code == 400

def test_register_empty_password(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "",
        "name": "Test User"
    })
    assert response.status_code == 400

def test_register_empty_name(unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/register", json={
        "email": unique_email,
        "password": "password123",
        "name": ""
    })
    assert response.status_code == 400

def test_register_get_failure(unique_email):
    response = httpx.get(f"{BASE_URL}/api/auth/register")
    assert response.status_code == 404


# Tests Login Endpoint
def test_login_wrong_password(registered_user, unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_login_wrong_email(registered_user):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": "wrongemail@example.com",
        "password": "password123"
    })
    assert response.status_code == 401

def test_login_returns_token(registered_user, unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert response.status_code == 200
    assert "token" in response.json()

def test_login_returns_no_password(registered_user, unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert response.status_code == 200
    assert "password" not in response.json()

def test_login_returns_user_data(registered_user, unique_email):
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": unique_email,
        "password": "password123"
    })
    assert response.status_code == 200
    body = response.json()

    assert set(body.keys()) == {"token", "user"}
    assert set(body["user"].keys()) == {
        "id",
        "email",
        "name",
        "role"
    }
    assert body["user"]["name"] == "Test User"
    assert body["user"]["role"] == "customer"
    assert body["user"]["email"] == unique_email

def test_login_no_email():
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "password": "password123"
    })
    assert response.status_code == 400

def test_login_no_password():
    response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": "example@test.com"
    })
    assert response.status_code == 400

def test_login_get_failure(registered_user):
    response = httpx.get(f"{BASE_URL}/api/auth/login")
    assert response.status_code == 404

# Tests Me Endpoint
def test_me_authenticated_request(auth_headers):
    response = httpx.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert response.status_code == 200

def test_me_request_without_token():
    response = httpx.get(f"{BASE_URL}/api/auth/me")
    assert response.status_code == 401

def test_me_request_with_invalid_token():
    response = httpx.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer ..."})
    assert response.status_code == 401

def test_me_returns_user_data(auth_headers, registered_user):
    response = httpx.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == registered_user["user"]["email"]
    assert "password" not in response.json()

def test_me_request_with_malformed_auth_header():
    response = httpx.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "notatoken"})
    assert response.status_code == 401

def test_me_post_failure():
    response = httpx.post(f"{BASE_URL}/api/auth/me")
    assert response.status_code == 404


# Multi-functional Tests
def test_register_and_check_token(registered_user, unique_email):
    body = registered_user
    assert "token" in body
    me = httpx.get( # KEY
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {body['token']}"}
    )
    assert me.status_code == 200