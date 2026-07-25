from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, GitHubProfile
from app.auth.dependencies import get_current_user
from app.github.client import fetch_user_repositories
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/github", tags=["github"])

class GitHubConnectRequest(BaseModel):
    username: str

@router.post("/connect")
def connect_github(
    payload: GitHubConnectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    username = payload.username.strip()
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username is required"
        )
        
    try:
        # Fetch public repositories via the github client
        raw_repos = fetch_user_repositories(username)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch repositories for GitHub user '{username}': {str(e)}"
        )
        
    # Process repositories to extract required metadata
    processed_repos = []
    for r in raw_repos[:10]: # Limit to top 10 as per specs
        processed_repos.append({
            "name": r.get("name"),
            "url": r.get("html_url"),
            "languages": {r.get("language"): 100} if r.get("language") else {}, # Set primary language with default weight
            "stars": r.get("stargazers_count", 0),
            "lastUpdated": r.get("updated_at", "")[:10]
        })
        
    # Mock some inferred skills for Phase 4 stub
    mock_inferred_skills = [
        {
            "name": "Git & Collaboration",
            "confidence": "strong",
            "evidence": f"Found {len(raw_repos)} repositories on GitHub."
        }
    ]
    # If the user has a dominant language in their repositories, we can mock it as an inferred skill
    lang_counts = {}
    for repo in raw_repos:
        lang = repo.get("language")
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    if lang_counts:
        dominant_lang = max(lang_counts, key=lang_counts.get)
        mock_inferred_skills.append({
            "name": dominant_lang,
            "confidence": "strong",
            "evidence": f"Used as the primary language in {lang_counts[dominant_lang]} repositories."
        })
        
    # Check if a GitHub profile record already exists for this user
    git_profile = db.query(GitHubProfile).filter(GitHubProfile.user_id == current_user.id).first()
    if git_profile:
        git_profile.username = username
        git_profile.repos = processed_repos
        git_profile.inferred_skills = mock_inferred_skills
    else:
        git_profile = GitHubProfile(
            user_id=current_user.id,
            username=username,
            repos=processed_repos,
            inferred_skills=mock_inferred_skills
        )
        db.add(git_profile)
        
    db.commit()
    db.refresh(git_profile)
    
    return {
        "success": True,
        "data": {
            "username": git_profile.username,
            "repoCount": len(git_profile.repos)
        },
        "error": None
    }

@router.get("/analysis")
def get_github_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    git_profile = db.query(GitHubProfile).filter(GitHubProfile.user_id == current_user.id).first()
    if not git_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub profile is not connected yet"
        )
        
    return {
        "success": True,
        "data": {
            "username": git_profile.username,
            "repos": git_profile.repos,
            "inferredSkills": git_profile.inferred_skills
        },
        "error": None
    }
