from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Profile
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

class ProfileUpdateSchema(BaseModel):
    education: Optional[List[dict]] = None
    target_roles: Optional[List[str]] = None
    location: Optional[str] = None
    preferred_language: Optional[str] = None
    career_memory: Optional[List[str]] = None

@router.get("")
def get_profile(current_user: User = Depends(get_current_user)):
    profile = current_user.profile
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
            "updatedAt": profile.updated_at.isoformat()
        },
        "error": None
    }

@router.put("")
def update_profile(
    payload: ProfileUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    if payload.education is not None:
        profile.education = payload.education
    if payload.target_roles is not None:
        profile.target_roles = payload.target_roles
    if payload.location is not None:
        profile.location = payload.location
    if payload.preferred_language is not None:
        profile.preferred_language = payload.preferred_language
    if payload.career_memory is not None:
        profile.career_memory = payload.career_memory
        
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
            "updatedAt": profile.updated_at.isoformat()
        },
        "error": None
    }
