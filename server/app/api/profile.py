from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Profile, User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

class EducationItem(BaseModel):
    institution: str
    degree: str
    fieldOfStudy: str
    startYear: int
    endYear: Optional[int] = None

class ProfileUpdateSchema(BaseModel):
    education: List[EducationItem]
    target_roles: List[str]
    location: str
    preferred_language: str

@router.get("")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "success": True,
        "data": {
            "id": profile.id,
            "userId": profile.user_id,
            "education": profile.education,
            "targetRoles": profile.target_roles,
            "location": profile.location,
            "preferredLanguage": profile.preferred_language,
            "careerMemory": profile.career_memory,
            "updatedAt": profile.updated_at
        },
        "error": None
    }

@router.put("")
def update_profile(
    profile_data: ProfileUpdateSchema, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    profile.education = [item.dict() for item in profile_data.education]
    profile.target_roles = profile_data.target_roles
    profile.location = profile_data.location
    profile.preferred_language = profile_data.preferred_language
    
    db.commit()
    db.refresh(profile)
    
    return {
        "success": True,
        "data": {
            "id": profile.id,
            "userId": profile.user_id,
            "education": profile.education,
            "targetRoles": profile.target_roles,
            "location": profile.location,
            "preferredLanguage": profile.preferred_language,
            "careerMemory": profile.career_memory,
            "updatedAt": profile.updated_at
        },
        "error": None
    }
