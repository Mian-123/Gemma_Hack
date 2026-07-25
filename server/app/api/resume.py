from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
import uuid

router = APIRouter(prefix="/api/v1/resume", tags=["resume"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Mock parsing payload for scaffold verification
    mock_extracted = {
        "name": "Alex Mercer",
        "email": current_user.email,
        "phone": "+1234567890",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Git"],
        "experience": [
            {
                "company": "Stripe",
                "position": "Backend Intern",
                "startDate": "2023-06",
                "endDate": "2023-12",
                "description": "Built core banking features using Ruby and Go."
            }
        ],
        "education": [
            {
                "institution": "MIT",
                "degree": "B.S.",
                "fieldOfStudy": "Computer Science",
                "graduationYear": 2024
            }
        ],
        "projects": [
            {
                "title": "FastAPI Microservice Template",
                "description": "Standardized boilerplate template for API teams.",
                "technologies": ["FastAPI", "Docker", "SQLAlchemy"]
            }
        ],
        "certifications": ["AWS Certified Developer"],
        "confidenceScores": {
            "personal": 0.95,
            "skills": 0.9,
            "experience": 0.85,
            "education": 0.98
        }
    }

    return {
        "success": True,
        "data": mock_extracted,
        "error": None
    }
