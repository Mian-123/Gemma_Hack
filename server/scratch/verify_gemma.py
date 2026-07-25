import sys
import os
import json

# Ensure server/ is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Set mock env variables for testing if not present
os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///test.db")

import httpx
from app.database.session import SessionLocal
from app.database.models import AICallLog
from app.ai.ollama_client import ollama_client
from app.ai.embeddings import embed_text, cosine_similarity
from app.ai.resume_ai import parse_resume_text
from app.ai.skill_gap_ai import analyze_skill_gap
from app.ai.roadmap_ai import generate_learning_roadmap
from app.ai.matching_ai import evaluate_opportunity_fit
from app.ai.market_ai import generate_market_insights
from app.ai.interview_ai import generate_interview_prep
from app.ai.coverletter_ai import generate_cover_letter

SAMPLE_RESUME = """
Jane Doe
jane.doe@example.com | +1-555-0199
SUMMARY
Experienced Python Developer with expertise in FastAPI, PostgreSQL, and basic Docker.
SKILLS
Python, FastAPI, SQL, PostgreSQL, Docker, Git
EXPERIENCE
Backend Engineer at WebCorp (2023-Present)
- Developed REST APIs using FastAPI and SQLAlchemy
- Integrated PostgreSQL databases and cached queries using Redis
EDUCATION
B.S. in Computer Science, Tech University (2020-2023)
"""

SAMPLE_JD = """
We are looking for a Backend Engineer.
Requirements:
- Python
- FastAPI
- Docker containerization
- Kubernetes orchestration
- PostgreSQL
- Experience building RESTful web services
"""

def check_ollama_status() -> bool:
    try:
        response = httpx.get("http://localhost:11434/api/tags", timeout=3.0)
        if response.status_code == 200:
            print("Local Ollama service is running!")
            models = [m["name"] for m in response.json().get("models", [])]
            print(f"Available local models: {models}")
            return True
    except Exception:
        pass
    print("\n[WARNING] Local Ollama service is not running or unreachable on http://localhost:11434.")
    print("AI calls will trigger the safe fallback logic as designed. Testing fallback logic...")
    return False

def test_embeddings():
    print("\n--- Testing Embeddings ---")
    try:
        v1 = embed_text("Python developer")
        v2 = embed_text("Django programmer")
        v3 = embed_text("Graphic designer")
        sim_close = cosine_similarity(v1, v2)
        sim_far = cosine_similarity(v1, v3)
        print(f"Vector dimension: {len(v1)}")
        print(f"Similarity (Python dev vs Django prog): {round(sim_close, 3)}")
        print(f"Similarity (Python dev vs Designer): {round(sim_far, 3)}")
        assert len(v1) == 384
        assert sim_close > sim_far
        print("[PASS] Embeddings check passed!")
    except Exception as e:
        print(f"[FAIL] Embeddings error: {e}")

def test_resume_parser():
    print("\n--- Testing Resume Parser ---")
    try:
        res = parse_resume_text(SAMPLE_RESUME)
        print(f"Parsed Name: {res.name}")
        print(f"Parsed Email: {res.email}")
        print(f"Parsed Skills: {res.skills}")
        print(f"Confidence Scores: {res.confidence_scores.model_dump()}")
        print("[PASS] Resume parser check passed!")
    except Exception as e:
        print(f"[FAIL] Resume parser error: {e}")

def test_skill_gap():
    print("\n--- Testing Skill Gap AI ---")
    profile = {
        "skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker"],
        "preferred_language": "Python"
    }
    try:
        res = analyze_skill_gap(profile, SAMPLE_JD)
        print(f"Overall Match: {res.overallMatchPercentage}%")
        print(f"Summary: {res.gapSummary}")
        print(f"Seed Skills for Roadmap: {res.roadmapSeedSkills}")
        print("[PASS] Skill Gap AI check passed!")
    except Exception as e:
        print(f"[FAIL] Skill Gap AI error: {e}")

def test_roadmap():
    print("\n--- Testing Roadmap AI ---")
    try:
        res = generate_learning_roadmap(
            role_title="Backend Engineer",
            missing_skills=["Kubernetes", "Redis"],
            career_memory=["Knows Python and basic Docker container concepts."]
        )
        print(f"Roadmap steps generated: {len(res.steps)}")
        for step in res.steps:
            print(f"  Step {step.stepNumber}: {step.topic} (Est. Hours: {step.estimatedHours})")
        print("[PASS] Roadmap AI check passed!")
    except Exception as e:
        print(f"[FAIL] Roadmap AI error: {e}")

def test_matching():
    print("\n--- Testing Opportunity Matching ---")
    profile = {
        "skills": ["Python", "FastAPI"],
        "preferred_language": "Python"
    }
    opp = {
        "title": "FastAPI Developer",
        "company": "TechStart",
        "description": "Looking for a FastAPI expert to build cloud-native services.",
        "skillsRequired": ["Python", "FastAPI", "AWS"]
    }
    try:
        res = evaluate_opportunity_fit(profile, opp)
        print(f"Score: {res.score}")
        print(f"Explanation: {res.explanation}")
        print(f"Urgency: {res.urgency}")
        print("[PASS] Opportunity matching check passed!")
    except Exception as e:
        print(f"[FAIL] Opportunity matching error: {e}")

def test_market():
    print("\n--- Testing Market Intelligence ---")
    top_skills = [
        {"skillName": "Python", "count": 12, "frequencyPercentage": 80.0},
        {"skillName": "FastAPI", "count": 9, "frequencyPercentage": 60.0},
        {"skillName": "Kubernetes", "count": 3, "frequencyPercentage": 20.0}
    ]
    try:
        res = generate_market_insights("job", 15, top_skills)
        print(f"Insights Count: {len(res.insights)}")
        for ins in res.insights:
            print(f"  - {ins.title} ({ins.type}): {ins.description}")
        print("[PASS] Market intelligence check passed!")
    except Exception as e:
        print(f"[FAIL] Market intelligence error: {e}")

def test_interview_prep():
    print("\n--- Testing Interview Prep ---")
    profile = {
        "skills": ["Python", "FastAPI"],
        "certifications": ["AWS Practitioner"]
    }
    try:
        res = generate_interview_prep("Backend Engineer", SAMPLE_JD, profile)
        print(f"Questions Generated: {len(res.questions)}")
        print(f"Sample Question 1: {res.questions[0].question}")
        print("[PASS] Interview prep check passed!")
    except Exception as e:
        print(f"[FAIL] Interview prep error: {e}")

def test_cover_letter():
    print("\n--- Testing Cover Letter ---")
    profile = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "skills": ["Python", "FastAPI"],
        "experience": ["2 years backend developer at TechStart"]
    }
    try:
        res = generate_cover_letter("Backend Engineer", SAMPLE_JD, profile, "conversational")
        print(f"Subject: {res.subject}")
        print(f"Letter Body Size: {len(res.body)} characters")
        print("[PASS] Cover letter check passed!")
    except Exception as e:
        print(f"[FAIL] Cover letter error: {e}")

def verify_db_logs():
    print("\n--- Verifying AI Call Logs in DB ---")
    db = SessionLocal()
    try:
        logs = db.query(AICallLog).order_by(AICallLog.timestamp.desc()).limit(10).all()
        print(f"Total log records in database: {db.query(AICallLog).count()}")
        print("Last 5 AI call log items:")
        for log in logs[:5]:
            print(f"  [{log.timestamp}] {log.function_name} -> {log.output_schema} (Duration: {log.duration_ms}ms)")
        print("[PASS] Database logs verified!")
    except Exception as e:
        print(f"[FAIL] DB log verification error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("==================================================")
    print("Starting Gemma AI Service Verification Tests...")
    print("==================================================")
    
    # 1. Check local Ollama service status
    ollama_active = check_ollama_status()
    
    # 2. Run embeddings (does not depend on Ollama)
    test_embeddings()
    
    # 3. Run Gemma evaluations
    if ollama_active:
        test_resume_parser()
        test_skill_gap()
        test_roadmap()
        test_matching()
        test_market()
        test_interview_prep()
        test_cover_letter()
    else:
        print("\nSkipping real Gemma text tests because local Ollama is not active.")
        print("The API endpoints will execute schema-safe fallback logic automatically.")
        
    # 4. Verify DB logging
    verify_db_logs()
    
    print("\n==================================================")
    print("Verification Completed!")
    print("==================================================")
