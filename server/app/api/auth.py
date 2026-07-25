from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Profile
from app.auth.jwt import get_password_hash, verify_password, create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")

class TokenResponseData(BaseModel):
    token: str
    user: dict

@router.post("/register")
def register(payload: UserAuthSchema, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
        
    # Create user
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        email=payload.email,
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.flush() # Flush to get new_user.id
    
    # Auto-create empty Profile profile matching specifications
    new_profile = Profile(
        user_id=new_user.id,
        education=[],
        target_roles=[],
        location="Remote",
        preferred_language="Python",
        career_memory=[]
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)
    
    # Create JWT
    token = create_access_token(data={"sub": new_user.email})
    
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "createdAt": new_user.created_at.isoformat()
            }
        },
        "error": None
    }

@router.post("/login")
def login(payload: UserAuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    token = create_access_token(data={"sub": user.email})
    
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "createdAt": user.created_at.isoformat()
            }
        },
        "error": None
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    profile_data = None
    if current_user.profile:
        profile_data = {
            "id": current_user.profile.id,
            "education": current_user.profile.education,
            "targetRoles": current_user.profile.target_roles,
            "location": current_user.profile.location,
            "preferredLanguage": current_user.profile.preferred_language,
            "careerMemory": current_user.profile.career_memory,
            "updatedAt": current_user.profile.updated_at.isoformat()
        }
        
    return {
        "success": True,
        "data": {
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "createdAt": current_user.created_at.isoformat()
            },
            "profile": profile_data
        },
        "error": None
    }
