import pytest
from app import app

# Test the home page
def test_home_page():
    """Test that the home page is served correctly."""
    with app.test_client() as client:
        response = client.get('/')
        assert response.status_code == 200
        assert b'Code Analyzer' in response.data

# Test for analyze endpoint when no code is provided
def test_analyze_endpoint_no_code():
    """Test the analyze endpoint with no code input."""
    with app.test_client() as client:
        response = client.post('/analyze', json={})
        assert response.status_code == 400
        assert response.json['status'] == 'error'
        assert response.json['message'] == 'No code provided.'

# Test for analyze endpoint with valid Python code
def test_analyze_endpoint_with_valid_code():
    """Test the analyze endpoint with valid Python code."""
    with app.test_client() as client:
        code = "print('Hello, world!')"
        response = client.post('/analyze', json={'code': code})
        assert response.status_code == 200
        assert response.json['syntax']['status'] == 'success'
        assert 'No syntax errors detected.' in response.json['syntax']['message']

# Test for analyze endpoint with invalid Python code
def test_analyze_endpoint_with_invalid_code():
    """Test the analyze endpoint with invalid Python code."""
    with app.test_client() as client:
        code = "print('Hello, world!"  # Missing closing quote
        response = client.post('/analyze', json={'code': code})
        assert response.status_code == 200
        assert response.json['syntax']['status'] == 'error'
        assert 'unexpected EOF while parsing' in response.json['syntax']['message']

# Test function for API endpoint using requests module (can be separate or combined with pytest)
def run_api_tests():
    """Run tests against the /analyze endpoint."""
    import requests

    # Define the API endpoint
    API_URL = "http://127.0.0.1:5000/analyze"

    # Test payloads
    test_cases = [
        {"description": "Empty code", "code": ""},
        {"description": "Code with eval", "code": "x = eval('2 + 2')"},
        {"description": "Code with no issues", "code": "print('Hello, World!')"},
        {"description": "Code with multiple issues", "code": "os.system('ls'); pickle.loads(data)"},
    ]

    for case in test_cases:
        print(f"Testing: {case['description']}")
        response = requests.post(API_URL, json={"code": case["code"]})
        print(response.json())
        print("-" * 40)

# Use pytest for running tests
if __name__ == "__main__":
    pytest.main()

    # Optionally run API tests separately if needed
    # run_api_tests()  # Uncomment if you want to use requests directly
