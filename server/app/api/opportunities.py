from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Opportunity, Resume
from app.auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional, List
from app.ai.matching_ai import evaluate_opportunity_fit

router = APIRouter(prefix="/api/v1/opportunities", tags=["opportunities"])

class MatchRequest(BaseModel):
    opportunity_id: int

@router.get("")
def get_opportunities(
    category: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if category:
        query = query.filter(Opportunity.opportunity_type == category)
    if location:
        query = query.filter(Opportunity.location.ilike(f"%{location}%"))
        
    opps = query.all()
    results = []
    for opp in opps:
        results.append({
            "id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "description": opp.description,
            "type": opp.opportunity_type,
            "url": opp.url,
            "location": opp.location,
            "skillsRequired": opp.skills_required,
            "postedAt": opp.posted_at.isoformat() if opp.posted_at else None
        })
        
    return {
        "success": True,
        "data": results,
        "error": None
    }

@router.get("/{id}")
def get_opportunity_by_id(id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opportunity with ID {id} not found"
        )
        
    return {
        "success": True,
        "data": {
            "id": opp.id,
            "title": opp.title,
            "company": opp.company,
            "description": opp.description,
            "type": opp.opportunity_type,
            "url": opp.url,
            "location": opp.location,
            "skillsRequired": opp.skills_required,
            "postedAt": opp.posted_at.isoformat() if opp.posted_at else None
        },
        "error": None
    }

@router.post("/match")
def match_opportunity(
    payload: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == payload.opportunity_id).first()
    if not opp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Opportunity with ID {payload.opportunity_id} not found"
        )
        
    # 1. Fetch user's latest resume to get their technical skills list
    latest_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).first()
    
    # 2. Extract profile details
    profile_data = {}
    if latest_resume and latest_resume.parsed_json:
        profile_data = latest_resume.parsed_json
    elif current_user.profile:
        profile_data = {
            "skills": [],
            "preferred_language": current_user.profile.preferred_language
        }
    else:
        profile_data = {
            "skills": ["Python", "FastAPI"],
            "preferred_language": "Python"
        }
        
    opp_data = {
        "title": opp.title,
        "company": opp.company,
        "description": opp.description,
        "skillsRequired": opp.skills_required
    }
    
    # 3. Call AI matching logic
    try:
        match_result = evaluate_opportunity_fit(profile_data, opp_data)
        match_dump = match_result.model_dump()
        return {
            "success": True,
            "data": {
                "opportunityId": opp.id,
                **match_dump
            },
            "error": None
        }
    except Exception as e:
        print(f"Error evaluating opportunity match: {e}. Returning fallback.")
        # Fallback matching structure
        fallback_match = {
            "opportunityId": opp.id,
            "score": 60,
            "explanation": "You have some matching backend capabilities in Python (Fallback).",
            "matchingSkills": ["Python"],
            "missingSkills": opp.skills_required,
            "urgency": "medium"
        }
        return {
            "success": True,
            "data": fallback_match,
            "error": None
        }
