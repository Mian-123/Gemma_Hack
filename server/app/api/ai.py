from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.auth.dependencies import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/api/v1", tags=["ai"])

# 1. Skill Gap Request
class SkillGapRequest(BaseModel):
    job_description: str

# 2. Roadmap Request
class RoadmapRequest(BaseModel):
    role_title: str
    missing_skills: List[str]

# 3. Interview Request
class InterviewRequest(BaseModel):
    role_title: str
    job_description: str

# 4. Cover Letter Request
class CoverLetterRequest(BaseModel):
    role_title: str
    job_description: str
    tone: str

@router.post("/skills/gap-analysis")
def gap_analysis(req: SkillGapRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mock_gap = {
        "overall_match_percentage": 75,
        "gap_summary": "Candidate matches backend, lacks Docker and Kubernetes skills.",
        "skills": [
            {"skill": "Python", "category": "matched", "details": "Strong backend experience."},
            {"skill": "Docker", "category": "missing", "details": "Not listed on profile."}
        ],
        "roadmap_seed_skills": ["Docker", "Kubernetes"]
    }
    return {
        "success": True,
        "data": mock_gap,
        "error": None
    }

@router.post("/tools/roadmap")
def generate_roadmap(req: RoadmapRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mock_roadmap = {
        "role_title": req.role_title,
        "steps": [
            {
                "step_number": 1,
                "topic": "Docker Basics",
                "concepts": ["Images", "Containers", "Dockerfiles"],
                "estimated_hours": 8,
                "resources": ["Official Docker docs"]
            }
        ],
        "projects": [
            {
                "title": "Dockerized web API",
                "description": "Containerize a simple python web server.",
                "skills_exercised": ["Docker"]
            }
        ]
    }
    return {
        "success": True,
        "data": mock_roadmap,
        "error": None
    }

@router.post("/tools/interview")
def generate_interview(req: InterviewRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mock_interview = {
        "role_title": req.role_title,
        "questions": [
            {
                "question_number": 1,
                "question": "What is the difference between a container and a VM?",
                "question_type": "technical",
                "suggested_answer": "Containers share host kernel, VMs run full guest OS.",
                "evaluation_criteria": "Understanding of resource isolation."
            }
        ]
    }
    return {
        "success": True,
        "data": mock_interview,
        "error": None
    }

@router.post("/tools/cover-letter")
def generate_cover_letter(req: CoverLetterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    mock_letter = {
        "tone": req.tone,
        "content": "Dear Hiring Manager,\n\nI am writing to apply for the Backend role. I bring strong skills in Python..."
    }
    return {
        "success": True,
        "data": mock_letter,
        "error": None
    }
