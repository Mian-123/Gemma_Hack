# Database Schema Design (database-schema.md)

## 1. Relational Database Schema (Supabase PostgreSQL)

```sql
-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Profiles Table
CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education JSONB NOT NULL, -- List of objects: institution, degree, fieldOfStudy, startYear, endYear
    target_roles JSONB NOT NULL, -- List of strings
    location VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(50) NOT NULL,
    career_memory JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of strings (extracted facts)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Resumes Table
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(512) NOT NULL, -- Path in Supabase Storage 'resumes' bucket
    extracted_text TEXT NOT NULL,
    parsed_json JSONB NOT NULL,
    confidence_scores JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. GitHub Profiles Table
CREATE TABLE github_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    repos JSONB NOT NULL, -- Repository list, languages, star count
    inferred_skills JSONB NOT NULL, -- Skills deduced by Gemma 4 E2B
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Opportunities Table
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL, -- job, internship, hackathon, project
    url VARCHAR(512) NOT NULL,
    location VARCHAR(255) NOT NULL,
    skills_required JSONB NOT NULL, -- List of strings
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Skill Gap Reports Table
CREATE TABLE skill_gap_reports (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    overall_match_percentage INT NOT NULL,
    gap_summary TEXT NOT NULL,
    skills JSONB NOT NULL, -- Details of matched/weak/missing/extra
    roadmap_seed_skills JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Roadmaps Table
CREATE TABLE roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_gap_report_id INT REFERENCES skill_gap_reports(id) ON DELETE SET NULL,
    role_title VARCHAR(255) NOT NULL,
    steps JSONB NOT NULL, -- Ordered learning steps
    projects JSONB NOT NULL, -- Project recommendations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Market Insights Table
CREATE TABLE market_insights (
    id SERIAL PRIMARY KEY,
    role_category VARCHAR(100) NOT NULL,
    sample_size INT NOT NULL,
    top_skills JSONB NOT NULL, -- Skill frequencies
    insights JSONB NOT NULL, -- Gemma structured insights
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Interview Sets Table
CREATE TABLE interview_sets (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    questions JSONB NOT NULL, -- Question & suggested answer sets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Cover Letters Table
CREATE TABLE cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. AI Call Logs Table
CREATE TABLE ai_call_logs (
    id SERIAL PRIMARY KEY,
    function_name VARCHAR(100) NOT NULL,
    input_summary TEXT NOT NULL,
    duration_ms INT NOT NULL,
    output_schema VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

---

## 2. SQLAlchemy Model Definitions

```python
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False)

class Profile(Base):
    __tablename__ = 'profiles'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    education = Column(JSONB, nullable=False)
    target_roles = Column(JSONB, nullable=False)
    location = Column(String(255), nullable=False)
    preferred_language = Column(String(50), nullable=False)
    career_memory = Column(JSONB, default=[], nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = 'resumes'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    extracted_text = Column(Text, nullable=False)
    parsed_json = Column(JSONB, nullable=False)
    confidence_scores = Column(JSONB, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

class Opportunity(Base):
    __tablename__ = 'opportunities'
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    opportunity_type = Column(String(50), nullable=False)
    url = Column(String(512), nullable=False)
    location = Column(String(255), nullable=False)
    skills_required = Column(JSONB, nullable=False)
    posted_at = Column(DateTime, default=func.now(), nullable=False)

class AICallLog(Base):
    __tablename__ = 'ai_call_logs'
    id = Column(Integer, primary_key=True)
    function_name = Column(String(100), nullable=False)
    input_summary = Column(Text, nullable=False)
    duration_ms = Column(Integer, nullable=False)
    output_schema = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
```

---

## 3. Database Indexes

To optimize performance under query loads:
1. **User Activity Index:** Index (`user_id`, `created_at`) on logs and reports to speed up personal history retrieval.
2. **Opportunity Index:** Composite Index (`opportunity_type`, `location`) to optimize feed filtration logic.
3. **Logs Time Index:** Index (`created_at`) on `ai_call_logs` for cleanup and telemetry aggregation.

```sql
CREATE INDEX idx_skill_gap_user_created ON skill_gap_reports(user_id, created_at DESC);
CREATE INDEX idx_opportunities_type_loc ON opportunities(opportunity_type, location);
CREATE INDEX idx_ai_call_logs_created ON ai_call_logs(created_at DESC);
```

---

## 4. Realistic Seed SQL Rows

```sql
-- Seed User
INSERT INTO users (id, email, hashed_password) 
VALUES (1, 'developer@example.com', '$2b$12$K18mZ708lWbM8XvX.t1.KOhU6b/p029n2m.11Wb.u7BqP1W9p9k4q');

-- Seed Profile
INSERT INTO profiles (user_id, education, target_roles, location, preferred_language, career_memory)
VALUES (1, 
        '[{"institution": "Tech State Univ", "degree": "B.S.", "fieldOfStudy": "Computer Science", "startYear": 2022, "endYear": 2026}]'::jsonb,
        '["Backend Developer", "Software Engineer"]'::jsonb,
        'San Francisco, CA',
        'Python',
        '["Interested in scalable backend microservices", "Strong preference for Python and FastAPI", "Needs to learn Docker"]'::jsonb);

-- Seed Opportunity
INSERT INTO opportunities (title, company, description, opportunity_type, url, location, skills_required)
VALUES ('Junior Backend Engineer', 
        'Vercel Inc.', 
        'We are looking for a junior backend engineer with solid programming fundamentals. Experience with Python, FastAPI, and Postgres is highly desirable. Docker knowledge is a plus.',
        'job',
        'https://example.com/jobs/vercel-1',
        'Remote',
        '["Python", "FastAPI", "PostgreSQL", "Docker"]'::jsonb);
```
