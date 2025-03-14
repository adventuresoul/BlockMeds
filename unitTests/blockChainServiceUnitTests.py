import pytest
import requests
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = os.getenv("BLOCKCHAINSERVICE_URL")
API_KEY = os.getenv("API_KEY")
DOCTOR_PUBLIC_KEY = os.getenv("DOCTOR_PUBLIC_KEY")
DOCTOR_PRIVATE_KEY = os.getenv("DOCTOR_PRIVATE_KEY")
PHARMACIST_PUBLIC_KEY = os.getenv("PHARMACIST_PUBLIC_KEY")
PHARMACIST_PRIVATE_KEY = os.getenv("PHARMACIST_PRIVATE_KEY")
REGULATORY_ADDRESS = os.getenv("REGULATORY_ADDRESS")

headers = {"authorization": API_KEY}

@pytest.fixture
def client():
    """Sets up a test client session"""
    with requests.Session() as session:
        yield session

def test_prescription_count(client):
    response = client.get(f"{BASE_URL}/prescriptionCount", headers=headers)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data.get("success") is True
    assert "count" in json_data

def test_create_prescription(client):
    payload = {
        "doctorAddress": DOCTOR_PUBLIC_KEY,
        "patientId": "12345",
        "drug": "morphine",
        "dosage": "500",
        "quantity": 10,
        "emergency": True,
        "justification": "Emergency, very high fever",
        "privateKey": DOCTOR_PRIVATE_KEY
    }
    response = client.post(f"{BASE_URL}/createPrescription", headers=headers, json=payload)
    
    assert response.status_code in [200, 201, 400]
    json_data = response.json()
    assert "success" in json_data

def test_view_transaction(client):
    tx_hash = "0x55c5017bdce28f3f9bd5cae34fc9ad3e65b325abf2ca86909b18a960dc6c55d1"
    response = client.get(f"{BASE_URL}/viewTransaction/{tx_hash}", headers=headers)
    
    assert response.status_code in [200, 400, 404]
    json_data = response.json()
    assert "success" in json_data

def test_fulfill_prescription(client):
    payload = {
        "prescriptionId": "5",
        "pharmacistAddress": PHARMACIST_PUBLIC_KEY,
        "privateKey": PHARMACIST_PRIVATE_KEY
    }
    response = client.post(f"{BASE_URL}/fulfillPrescription", headers=headers, json=payload)
    
    assert response.status_code in [200, 400, 404, 409]
    json_data = response.json()
    assert "success" in json_data

def test_get_safe_limit(client):
    drug = "morphine"
    response = client.get(f"{BASE_URL}/getSafeLimit/{drug}", headers=headers)
    
    assert response.status_code in [200, 400]
    json_data = response.json()
    assert "success" in json_data

def test_set_safe_limit(client):
    payload = {
        "regulatoryAuthorityAddress": REGULATORY_ADDRESS,
        "drug": "Paracetamol",
        "limit": "650"
    }
    response = client.post(f"{BASE_URL}/setSafeLimit", headers=headers, json=payload)
    
    assert response.status_code in [200, 400]
    json_data = response.json()
    assert "success" in json_data

def test_get_regulatory_authority(client):
    response = client.get(f"{BASE_URL}/getRegulatoryAuthority", headers=headers)
    
    assert response.status_code == 200
    json_data = response.json()
    assert "success" in json_data
    assert "regulatoryAuthority" in json_data

def test_resolve_flagged_prescription(client):
    payload = {
        "regulatoryAuthorityAddress": REGULATORY_ADDRESS,
        "prescriptionId": "7",
        "resolution": "Reason satisfactory"
    }
    response = client.post(f"{BASE_URL}/resolveFlaggedPrescription", headers=headers, json=payload)
    
    assert response.status_code in [200, 400]
    json_data = response.json()
    assert "success" in json_data

def test_view_prescription(client):
    prescriptionNumber = "7"
    response = client.get(f"{BASE_URL}/viewPrescription/{prescriptionNumber}", headers=headers)
    
    assert response.status_code in [200, 400, 404]
    json_data = response.json()
    assert "success" in json_data

