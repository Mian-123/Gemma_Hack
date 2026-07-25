from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Profile
from app.auth.jwt import verify_password, get_password_hash, create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(auth_data: UserAuthSchema, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == auth_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(auth_data.password)
    user = User(email=auth_data.email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto create empty profile
    profile = Profile(
        user_id=user.id,
        education=[],
        target_roles=[],
        location="Remote",
        preferred_language="Python"
    )
    db.add(profile)
    db.commit()

    token = create_access_token(data={"sub": user.email})
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {"id": user.id, "email": user.email}
        },
        "error": None
    }

@router.post("/login")
def login(auth_data: UserAuthSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == auth_data.email).first()
    if not user or not verify_password(auth_data.password, user.hashed_password):
         raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    token = create_access_token(data={"sub": user.email})
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {"id": user.id, "email": user.email}
        },
        "error": None
    }
