from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.models import Opportunity
from typing import Dict, List, Tuple

def compute_skill_metrics(db: Session, role_category: str) -> Dict:
    # 1. Fetch opportunities matching the role category in title, description, or type
    query = db.query(Opportunity).filter(
        (Opportunity.title.ilike(f"%{role_category}%")) |
        (Opportunity.description.ilike(f"%{role_category}%")) |
        (Opportunity.opportunity_type.ilike(f"%{role_category}%"))
    )
    
    opportunities = query.all()
    sample_size = len(opportunities)
    
    # 2. Check minimum sample size requirement of 10
    if sample_size < 10:
        return {
            "success": True,
            "data": None,
            "error": f"Insufficient data: Need at least 10 opportunities for this role category (Currently: {sample_size})."
        }
        
    # 3. Calculate skill frequencies
    skill_counts = {}
    for opp in opportunities:
        # opp.skills_required is a list of strings
        if opp.skills_required and isinstance(opp.skills_required, list):
            for skill in opp.skills_required:
                normalized_skill = skill.strip()
                if normalized_skill:
                    # Let's count ignoring case for merging, but keep title casing
                    skill_counts[normalized_skill] = skill_counts.get(normalized_skill, 0) + 1
                    
    # Sort skills by count descending, then alphabetically by name to break ties consistently
    sorted_skills = sorted(
        skill_counts.items(),
        key=lambda x: (-x[1], x[0].lower())
    )
    
    top_skills = []
    for skill_name, count in sorted_skills[:15]: # Top 15 as per specs
        percentage = round((count / sample_size) * 100.0, 1)
        top_skills.append({
            "skillName": skill_name,
            "frequencyPercentage": percentage,
            "count": count
        })
        
    return {
        "success": True,
        "data": {
            "roleCategory": role_category,
            "sampleSize": sample_size,
            "topSkills": top_skills
        },
        "error": None
    }
