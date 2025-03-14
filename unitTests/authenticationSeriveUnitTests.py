import pytest
import requests

BASE_URL = "http://localhost:5001"  # Adjust to your server's address

# Sample test data
patient_data = {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "contactNumber": "1234567890",
    "email": "john.doe@example.com",
    "password": "securePass123",
    "profileUrl": "http://example.com/profile.jpg"
}

doctor_data = {
    "firstName": "Alice",
    "lastName": "Smith",
    "dateOfBirth": "1985-05-15",
    "gender": "female",
    "contactNumber": "9876543210",
    "email": "alice.smith@example.com",
    "password": "strongPassword",
    "ethereumWalletAddress": "0xDeF456...",
    "profileUrl": "http://example.com/doc-profile.jpg",
    "specialization": "Cardiology",
    "medicalLicenseId": "ML123456"
}

pharmacist_data = {
    "firstName": "Bob",
    "lastName": "Brown",
    "dateOfBirth": "1988-09-20",
    "gender": "male",
    "contactNumber": "1122334455",
    "email": "bob.brown@example.com",
    "password": "pharmaPass789",
    "ethereumWalletAddress": "0xAbC123...",
    "profileUrl": "http://example.com/pharm-profile.jpg",
    "pharmacyLicenseId": "PL789123"
}


@pytest.fixture
def client():
    """Sets up a test client session"""
    with requests.Session() as session:
        yield session


def test_auth_test_route(client):
    """Test authentication test route"""
    response = client.get(f"{BASE_URL}/test")
    assert response.status_code == 200
    assert response.json()["message"] == "auth Test Route Working!"


def test_register_patient(client):
    """Test patient registration"""
    response = client.post(f"{BASE_URL}/register/patient", json=patient_data)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "patient" in response.json()


def test_register_doctor(client):
    """Test doctor registration"""
    response = client.post(f"{BASE_URL}/register/doctor", json=doctor_data)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "doctor" in response.json()


def test_register_pharmacist(client):
    """Test pharmacist registration"""
    response = client.post(f"{BASE_URL}/register/pharmacist", json=pharmacist_data)
    assert response.status_code == 201
    assert response.json()["success"] is True
    assert "pharmacist" in response.json()


def test_login_invalid_user(client):
    """Test login with invalid credentials"""
    response = client.post(
        f"{BASE_URL}/login", json={"id": 0, "email": "invalid@example.com", "password": "wrongPass"}
    )
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert response.json()["error"] == "Invalid credentials"


def test_login_valid_patient(client):
    """Test successful login for a patient"""
    response = client.post(
        f"{BASE_URL}/login", json={"id": 0, "email": patient_data["email"], "password": patient_data["password"]}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "token" in response.json()


def test_login_valid_doctor(client):
    """Test successful login for a doctor"""
    response = client.post(
        f"{BASE_URL}/login", json={"id": 1, "email": doctor_data["email"], "password": doctor_data["password"]}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "token" in response.json()


def test_login_valid_pharmacist(client):
    """Test successful login for a pharmacist"""
    response = client.post(
        f"{BASE_URL}/login", json={"id": 2, "email": pharmacist_data["email"], "password": pharmacist_data["password"]}
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "token" in response.json()


def test_register_missing_fields(client):
    """Test registration with missing required fields"""
    response = client.post(f"{BASE_URL}/register/patient", json={"email": "missing@example.com"})
    assert response.status_code == 400
    assert response.json()["success"] is False
    assert "Missing required fields" in response.json()["error"]
