from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/github", tags=["github"])

class GitHubAnalysisRequest(BaseModel):
    username: str

@router.post("/analyze")
def analyze_github(
    req: GitHubAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.username:
        raise HTTPException(status_code=400, detail="Username is required")
        
    mock_result = {
        "username": req.username,
        "repos": [
            {
                "name": "fastapi-demo",
                "url": f"https://github.com/{req.username}/fastapi-demo",
                "languages": {"Python": 14200, "HTML": 3200},
                "stars": 12,
                "lastUpdated": "2024-05-12"
            }
        ],
        "inferredSkills": [
            {
                "name": "FastAPI",
                "confidence": "strong",
                "evidence": "Configured server routes and setup SQLite schemas."
            }
        ]
    }
    
    return {
        "success": True,
        "data": mock_result,
        "error": None
    }
