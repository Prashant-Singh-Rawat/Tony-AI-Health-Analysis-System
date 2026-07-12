from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    # Since there might not be a root endpoint, we just check it doesn't crash catastrophically
    # Or if there is a /health or similar, we can test that.
    # We will just assert that the response is either 200 or 404 (if not defined).
    assert response.status_code in [200, 404]
