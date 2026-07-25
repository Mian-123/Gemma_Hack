import httpx
from typing import List

def fetch_user_repositories(username: str, token: str = None) -> List[dict]:
    headers = {
        "User-Agent": "OpportunityAI-Backend",
        "Accept": "application/vnd.github.v3+json"
    }
    if token:
        headers["Authorization"] = f"token {token}"
        
    url = f"https://api.github.com/users/{username}/repos?per_page=100"
    
    try:
        with httpx.Client() as client:
            response = client.get(url, headers=headers, timeout=10.0)
            if response.status_code == 404:
                raise ValueError(f"GitHub user '{username}' not found")
            response.raise_for_status()
            repos = response.json()
            return repos
    except Exception as e:
        print(f"Error querying GitHub API for {username}: {e}")
        raise e
