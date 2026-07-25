from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/market", tags=["market"])

@router.get("/intelligence")
def get_market_intelligence(
    role: str = "Backend Developer",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mock response mapping for scaffold check
    mock_intelligence = {
        "roleCategory": role,
        "sampleSize": 14,
        "topSkills": [
            {"skillName": "Python", "frequencyPercentage": 92.0, "count": 13},
            {"skillName": "FastAPI", "frequencyPercentage": 78.0, "count": 11},
            {"skillName": "Docker", "frequencyPercentage": 57.0, "count": 8}
        ],
        "insights": [
            {
                "title": "Python & FastAPI dominance",
                "type": "critical",
                "description": "FastAPI is requested in 78% of the backend developer listings we analyzed.",
                "priority": "high"
            }
        ],
        "generatedAt": "2026-07-25T12:00:00"
    }
    return {
        "success": True,
        "data": mock_intelligence,
        "error": None
    }
