from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Opportunity
from app.auth.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/v1/opportunities", tags=["opportunities"])

@router.get("")
def get_opportunities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opps = db.query(Opportunity).all()
    mock_matches = []
    
    for opp in opps:
        mock_matches.append({
            "opportunity": {
                "id": str(opp.id),
                "title": opp.title,
                "company": opp.company,
                "description": opp.description,
                "type": opp.opportunity_type,
                "url": opp.url,
                "location": opp.location,
                "skillsRequired": opp.skills_required,
                "postedAt": opp.posted_at.isoformat() if opp.posted_at else None
            },
            "score": 85,
            "explanation": "You have matching key backend skills in Python and FastAPI.",
            "matchingSkills": ["Python", "FastAPI"],
            "missingSkills": ["PostgreSQL"],
            "urgency": "medium"
        })
        
    return {
        "success": True,
        "data": mock_matches,
        "error": None
    }
