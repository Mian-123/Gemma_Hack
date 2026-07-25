# Mock Data & Seed Design (mock-data-seed.md)

## 1. Mock Opportunities (~20 listings across categories)

This JSON structure is stored in `mock-data/opportunities.json` and read during the setup phase to pre-populate the database.

```json
[
  {
    "title": "Junior Backend Developer",
    "company": "FastAPI Solutions",
    "description": "We are seeking a junior python backend developer with passion for building clean APIs. You will work with Python, FastAPI, SQLModel, and PostgreSQL. Docker experience is highly preferred.",
    "opportunity_type": "job",
    "url": "https://example.com/jobs/fastapi-solutions-jr",
    "location": "Remote",
    "skills_required": ["Python", "FastAPI", "PostgreSQL", "Docker", "SQLModel"]
  },
  {
    "title": "Global AI Innovation Hackathon",
    "company": "Kaggle Community",
    "description": "Develop and deploy an innovative local AI system using open models (such as Gemma). Teams will submit code repositories, model weights, and video demonstrations.",
    "opportunity_type": "hackathon",
    "url": "https://example.com/hackathons/kaggle-gemma-3",
    "location": "Online",
    "skills_required": ["Python", "Machine Learning", "Local Inference", "Gemma"]
  },
  {
    "title": "Frontend Development Intern",
    "company": "Tailwind Systems",
    "description": "Join our design engineering team as a Frontend Intern. Responsibilities include building responsive UI components in React and TypeScript using Tailwind CSS.",
    "opportunity_type": "internship",
    "url": "https://example.com/internships/tailwind-react",
    "location": "San Francisco, CA",
    "skills_required": ["React", "TypeScript", "Tailwind CSS", "HTML5"]
  },
  {
    "title": "Data Engineering Internship",
    "company": "Snowflake Analytics",
    "description": "Learn the ropes of cloud data warehousing and pipeline orchestration. Experience writing SQL queries and Python code is a strong requirement.",
    "opportunity_type": "internship",
    "url": "https://example.com/internships/snowflake-data",
    "location": "Seattle, WA",
    "skills_required": ["SQL", "Python", "Snowflake", "dbt"]
  },
  {
    "title": "AI & Ethics Research Fellowship",
    "company": "Partnership on AI",
    "description": "A research scholarship fellowship for graduates investigating the societal impacts and alignment strategies of local LLM models.",
    "opportunity_type": "project",
    "url": "https://example.com/projects/pai-ethics",
    "location": "London, UK",
    "skills_required": ["Research", "Ethics", "LLMs", "Technical Writing"]
  },
  {
    "title": "DevOps Associate",
    "company": "Cloud Infrastructure Corp",
    "description": "Help us manage our local and cloud virtualization deployments. Key tools include Docker, Kubernetes, Linux CLI, and Terraform.",
    "opportunity_type": "job",
    "url": "https://example.com/jobs/devops-associate",
    "location": "Austin, TX",
    "skills_required": ["Docker", "Kubernetes", "Linux", "Terraform", "CI/CD"]
  },
  {
    "title": "Machine Learning Engineer",
    "company": "NeuralCraft LLC",
    "description": "Build, fine-tune, and deploy localized models. Practical knowledge of PyTorch, Hugging Face, Transformers, and GPU acceleration is required.",
    "opportunity_type": "job",
    "url": "https://example.com/jobs/ml-engineer-neural",
    "location": "Boston, MA",
    "skills_required": ["PyTorch", "Hugging Face", "Transformers", "Python", "CUDA"]
  },
  {
    "title": "Next-Gen Web Hackathon",
    "company": "Vercel & Next.js",
    "description": "Build next-generation server-rendered React applications using Next.js 15, React Server Components, and Tailwind CSS.",
    "opportunity_type": "hackathon",
    "url": "https://example.com/hackathons/vercel-next-15",
    "location": "Online",
    "skills_required": ["React", "Next.js", "TypeScript", "Vercel"]
  },
  {
    "title": "Fullstack Apprentice",
    "company": "CodeAcademy Labs",
    "description": "An intensive fullstack training internship. Basic familiarity with JS, HTML, CSS, and Git is expected. You will learn modern frontend frameworks and database architectures.",
    "opportunity_type": "internship",
    "url": "https://example.com/internships/fullstack-apprentice",
    "location": "New York, NY",
    "skills_required": ["JavaScript", "HTML", "CSS", "Git"]
  },
  {
    "title": "Open Source Systems Builder",
    "company": "Apache Software Foundation",
    "description": "Contribute to database query optimization projects. Knowledge of C++, assembly debugging, and index systems is highly valued.",
    "opportunity_type": "project",
    "url": "https://example.com/projects/apache-db",
    "location": "Remote",
    "skills_required": ["C++", "SQL", "Database Internals", "Git"]
  }
]
```

*(Remaining 10 listings follow the identical layout structure representing alternative skill distributions: e.g. iOS Development, Cloud Solutions Architect, Product Manager, Cyber Security Analyst, etc.)*

---

## 2. Sample Resumes (3 profiles of varied completeness)

### Profile A: Highly Complete Backend Specialist
- **Name:** Alex Mercer
- **Education:** B.S. in Computer Science, MIT (2024)
- **Skills:** Python, FastAPI, Docker, PostgreSQL, Redis, Git, Linux
- **Experience:** Backend Intern at Stripe (6 months), Open Source Contributor.

### Profile B: Incomplete Frontend Graduate (Needs Guidance)
- **Name:** Sarah Connor
- **Education:** High School Graduate + Bootcamp Cert
- **Skills:** HTML, CSS, JavaScript, React (Junior Level)
- **Experience:** No formal engineering positions. Needs help spotting skill gaps and building roadmap steps.

### Profile C: Experienced Systems Engineer Transitioning to ML
- **Name:** David Lightman
- **Education:** M.S. in Systems Engineering, Stanford (2020)
- **Skills:** C++, Go, Kubernetes, Terraform, Python (Basic)
- **Experience:** Devops Engineer at Cloudflare (4 years). Wants to identify ML gaps (PyTorch, Math) to bridge into AI/ML roles.

---

## 3. Seed Script Reference (database/seed.py blueprint)

```python
# python seed script skeleton structure
import json
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database.models import Opportunity

def seed_db():
    db: Session = SessionLocal()
    try:
        # Load JSON file
        with open('mock-data/opportunities.json', 'r') as f:
            opportunities_data = json.load(f)
            
        for opp in opportunities_data:
            db_opp = Opportunity(
                title=opp['title'],
                company=opp['company'],
                description=opp['description'],
                opportunity_type=opp['opportunity_type'],
                url=opp['url'],
                location=opp['location'],
                skills_required=opp['skills_required']
            )
            db.add(db_opp)
        db.commit()
        print("Mock opportunities database successfully seeded!")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()
```
