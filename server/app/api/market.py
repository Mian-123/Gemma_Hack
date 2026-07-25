from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
from app.market.aggregator import compute_skill_metrics
from app.ai.market_ai import generate_market_insights
from pydantic import BaseModel
import datetime

router = APIRouter(prefix="/api/v1/market", tags=["market"])

class MarketInsightsRequest(BaseModel):
    roleCategory: str

@router.post("/insights")
def get_market_insights(
    payload: MarketInsightsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = payload.roleCategory.strip()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role category is required"
        )
        
    result = compute_skill_metrics(db, role)
    if result.get("error") or result.get("data") is None:
        # Returns 200 with the success: true, data: null, error: "Insufficient data..." format per specs
        return result
        
    agg_data = result["data"]
    top_skills = agg_data["topSkills"]
    
    # Call AI narrative reasoning evaluator
    try:
        report = generate_market_insights(
            role_category=agg_data["roleCategory"],
            sample_size=agg_data["sampleSize"],
            top_skills=top_skills
        )
        insights = report.model_dump()["insights"]
    except Exception as e:
        print(f"Error compiling AI market insights: {e}. Falling back to basic list.")
        # Fallback list of insights
        insights = [
            {
                "title": "Standard Industry Tools",
                "type": "trend",
                "description": "General tools represent the primary request footprint in listings (Fallback).",
                "priority": "medium"
            }
        ]
        
    return {
        "success": True,
        "data": {
            "roleCategory": agg_data["roleCategory"],
            "sampleSize": agg_data["sampleSize"],
            "topSkills": top_skills,
            "insights": insights,
            "generatedAt": datetime.datetime.now().isoformat()
        },
        "error": None
    }
