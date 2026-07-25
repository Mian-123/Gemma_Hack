from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Resume, SkillGapReport, Roadmap
from app.auth.dependencies import get_current_user
from app.limiter import limiter
from app.utils.sanitize import sanitize_jd_text, sanitize_text
from app.ai.ollama_client import AIGenerationError
from pydantic import BaseModel
from typing import List, Optional
from app.ai.skill_gap_ai import analyze_skill_gap
from app.ai.roadmap_ai import generate_learning_roadmap
from app.ai.interview_ai import generate_interview_prep
from app.ai.coverletter_ai import generate_cover_letter

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

class SkillGapRequest(BaseModel):
    jobDescription: str

class RoadmapRequest(BaseModel):
    roleTitle: str
    missingSkills: List[str]

class InterviewRequest(BaseModel):
    roleTitle: str
    jobDescription: str

class CoverLetterRequest(BaseModel):
    roleTitle: str
    jobDescription: str
    tone: str

@router.post("/skill-gap")
@limiter.limit("20/hour")
def skill_gap(
    request: Request,
    payload: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
            "skills": [],
            "preferred_language": "Python"
        }
        
    # 3. Sanitize JD text before passing to local Gemma
    safe_jd = sanitize_jd_text(payload.jobDescription)

    # 4. Call AI matching logic (runs against local Ollama — no external LLM API)
    try:
        report = analyze_skill_gap(profile_data, safe_jd)
        report_data = report.model_dump()

        # 5. Store report in database
        new_report = SkillGapReport(
            user_id=current_user.id,
            job_description=safe_jd,
            overall_match_percentage=report.overallMatchPercentage,
            gap_summary=report.gapSummary,
            skills=report_data["skills"],
            roadmap_seed_skills=report.roadmapSeedSkills
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "success": True,
            "data": {"id": new_report.id, **report_data},
            "error": None
        }
    except AIGenerationError as e:
        # Gemma / Ollama unreachable — surface as 503 so frontend can show graceful message
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Make sure Ollama is running locally and the gemma4:e2b model is pulled."
        )
    except Exception as e:
        print(f"Error compiling skill gap: {e}")
        raise HTTPException(status_code=500, detail=f"Skill gap analysis failed: {str(e)}")

@router.post("/roadmap")
@limiter.limit("20/hour")
def learning_roadmap(
    request: Request,
    payload: RoadmapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Retrieve user Career Memory facts if profile exists
    career_memory = []
    if current_user.profile and current_user.profile.career_memory:
        career_memory = current_user.profile.career_memory
        
    # 2. Sanitize inputs
    safe_role = sanitize_text(payload.roleTitle)
    safe_skills = [sanitize_text(s) for s in payload.missingSkills]

    # 3. Call AI roadmap planner (local Ollama)
    try:
        roadmap = generate_learning_roadmap(safe_role, safe_skills, career_memory)
        roadmap_data = roadmap.model_dump()

        # 4. Save roadmap to database
        new_roadmap = Roadmap(
            user_id=current_user.id,
            role_title=safe_role,
            steps=roadmap_data["steps"],
            projects=roadmap_data["projects"]
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)

        return {
            "success": True,
            "data": {"id": new_roadmap.id, **roadmap_data},
            "error": None
        }
    except AIGenerationError:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Make sure Ollama is running locally and the gemma4:e2b model is pulled."
        )
    except Exception as e:
        print(f"Error generating learning roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@router.post("/interview")
@limiter.limit("20/hour")
def interview_prep(
    request: Request,
    payload: InterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
            "certifications": [],
            "preferred_language": current_user.profile.preferred_language
        }
    else:
        profile_data = {
            "skills": ["Python", "FastAPI"],
            "certifications": [],
            "preferred_language": "Python"
        }

    # 3. Sanitize inputs
    safe_role = sanitize_text(payload.roleTitle)
    safe_jd = sanitize_jd_text(payload.jobDescription)

    # 4. Call AI interview planner (local Ollama)
    try:
        prep = generate_interview_prep(safe_role, safe_jd, profile_data)
        prep_data = prep.model_dump()
        return {"success": True, "data": prep_data, "error": None}
    except AIGenerationError:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Make sure Ollama is running locally."
        )
    except Exception as e:
        print(f"Error generating interview prep: {e}")
        raise HTTPException(status_code=500, detail=f"Interview prep failed: {str(e)}")

@router.post("/cover-letter")
@limiter.limit("20/hour")
def cover_letter(
    request: Request,
    payload: CoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
            "name": current_user.email.split("@")[0].capitalize(),
            "email": current_user.email,
            "skills": [],
            "experience": []
        }
    else:
        profile_data = {
            "name": "Developer Candidate",
            "email": current_user.email,
            "skills": ["Python", "FastAPI"],
            "experience": []
        }

    # 3. Sanitize inputs
    safe_role = sanitize_text(payload.roleTitle)
    safe_jd = sanitize_jd_text(payload.jobDescription)
    safe_tone = sanitize_text(payload.tone, max_length=50)

    # 4. Call AI cover letter draft builder (local Ollama)
    try:
        letter = generate_cover_letter(safe_role, safe_jd, profile_data, safe_tone)
        return {
            "success": True,
            "data": {"tone": safe_tone, "content": f"{letter.subject}\n\n{letter.body}"},
            "error": None
        }
    except AIGenerationError:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Make sure Ollama is running locally."
        )
    except Exception as e:
        print(f"Error generating cover letter: {e}")
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")

from fastapi.responses import StreamingResponse
import httpx
import json
from app.config import settings

async def stream_gemma_tokens(prompt: str, system: str = None):
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": True
    }
    if system:
        payload["system"] = system
        
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=payload) as response:
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            chunk = json.loads(line)
                            token = chunk.get("response", "")
                            if token:
                                yield f"data: {json.dumps({'token': token})}\n\n"
                        except Exception:
                            pass
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"

@router.get("/skill-gap/stream")
async def skill_gap_stream(
    jobDescription: str,
    current_user: User = Depends(get_current_user)
):
    safe_jd = sanitize_jd_text(jobDescription)
    system_prompt = "You are a skill gap analysis engine. Explain step-by-step how the candidate matches this job description and what gaps they need to fill."
    prompt = f"Job Description:\n{safe_jd}\n\nAnalyze the skill gap."
    return StreamingResponse(stream_gemma_tokens(prompt, system_prompt), media_type="text/event-stream")

@router.get("/roadmap/stream")
async def roadmap_stream(
    roleTitle: str,
    missingSkills: str,
    current_user: User = Depends(get_current_user)
):
    safe_role = sanitize_text(roleTitle)
    safe_skills = sanitize_text(missingSkills)
    system_prompt = "You are a learning roadmap planner. Outline a clear structured learning path."
    prompt = f"Target Role: {safe_role}\nMissing Skills to cover: {safe_skills}\n\nDraft a learning curriculum."
    return StreamingResponse(stream_gemma_tokens(prompt, system_prompt), media_type="text/event-stream")

