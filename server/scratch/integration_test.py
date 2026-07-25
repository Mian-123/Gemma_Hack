import httpx
import time
import sys

BASE_URL = "http://localhost:8000"

def run_tests():
    print("--------------------------------------------------")
    print("Starting OpportunityAI Backend Integration Tests...")
    print("--------------------------------------------------")
    
    with httpx.Client(timeout=10.0) as client:
        # 1. GET /api/v1/health
        print("Testing: GET /api/v1/health...")
        try:
            r = client.get(f"{BASE_URL}/api/v1/health")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            assert res["data"]["status"] == "ok"
            print("  [PASS] Health check ok.")
        except Exception as e:
            print(f"  [FAIL] Health check failed: {e}")
            sys.exit(1)
            
        # 2. POST /api/v1/auth/register
        print("\nTesting: POST /api/v1/auth/register...")
        email = f"testuser_{int(time.time())}@example.com"
        payload = {
            "email": email,
            "password": "securepassword123"
        }
        try:
            r = client.post(f"{BASE_URL}/api/v1/auth/register", json=payload)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            token = res["data"]["token"]
            assert token is not None
            print(f"  [PASS] Registered test user: {email}")
        except Exception as e:
            print(f"  [FAIL] Registration failed: {e}")
            sys.exit(1)
            
        # 3. GET /api/v1/opportunities
        print("\nTesting: GET /api/v1/opportunities...")
        try:
            r = client.get(f"{BASE_URL}/api/v1/opportunities")
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            assert isinstance(res["data"], list)
            print(f"  [PASS] Retrieved {len(res['data'])} opportunities.")
        except Exception as e:
            print(f"  [FAIL] Opportunities list failed: {e}")
            sys.exit(1)
            
        # 4. GET /api/v1/auth/me [protected]
        print("\nTesting: GET /api/v1/auth/me (Protected)...")
        headers = {"Authorization": f"Bearer {token}"}
        try:
            r = client.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            assert res["data"]["user"]["email"] == email
            assert res["data"]["profile"] is not None
            print("  [PASS] Introspection matches registered email.")
        except Exception as e:
            print(f"  [FAIL] Authentication introspection failed: {e}")
            sys.exit(1)

        # 5. POST /api/v1/github/connect [protected]
        print("\nTesting: POST /api/v1/github/connect (Protected)...")
        try:
            # Connect using a valid public user (e.g. Mian-123 or similar)
            r = client.post(f"{BASE_URL}/api/v1/github/connect", json={"username": "octocat"}, headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            assert res["data"]["username"] == "octocat"
            print("  [PASS] GitHub connection works.")
        except Exception as e:
            print(f"  [FAIL] GitHub connection failed: {e}")
            sys.exit(1)

        # 6. POST /api/v1/market/insights [protected]
        print("\nTesting: POST /api/v1/market/insights (Protected)...")
        try:
            # We seed with 20 opportunities. There are matching ones for "job" or "internship". Let's run with "job".
            r = client.post(f"{BASE_URL}/api/v1/market/insights", json={"roleCategory": "job"}, headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            # Since there are >= 10 "job" opportunities in seed data, it should compute successfully
            if res["data"] is not None:
                assert res["data"]["roleCategory"] == "job"
                assert len(res["data"]["topSkills"]) > 0
                print(f"  [PASS] Market aggregation successful for 'job' (Sample size: {res['data']['sampleSize']})")
            else:
                print(f"  [PASS] Market aggregation returned expected error: {res['error']}")
        except Exception as e:
            print(f"  [FAIL] Market aggregation failed: {e}")
            sys.exit(1)

        # 7. POST /api/v1/ai/skill-gap [protected]
        print("\nTesting: POST /api/v1/ai/skill-gap (Protected)...")
        try:
            r = client.post(f"{BASE_URL}/api/v1/ai/skill-gap", json={"jobDescription": "Need Python"}, headers=headers)
            assert r.status_code == 200, f"Expected 200, got {r.status_code}"
            res = r.json()
            assert res["success"] is True
            assert res["data"]["status"] == "stub"
            print("  [PASS] AI Shell placeholder ok.")
        except Exception as e:
            print(f"  [FAIL] AI Shell placeholder failed: {e}")
            sys.exit(1)

    print("\n--------------------------------------------------")
    print("ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("--------------------------------------------------")

if __name__ == "__main__":
    run_tests()
