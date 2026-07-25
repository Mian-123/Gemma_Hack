# Opportunity Engine Specification (opportunity-engine.md)

## Overview
This specification details the collection and matching engine for opportunities (jobs, internships, hackathons, open-source projects). The engine aggregates listings from multiple external and internal feeds, normalizes them, and feeds them into the local Gemma 4 E2B matching module. Gemma 4 E2B calculates a match score and creates a custom text description explaining why the user fits or what they are missing.

---

## User Stories
- **As a user**, I want to see a combined feed of job listings, hackathons, and internship roles in one unified interface.
- **As a user**, I want to understand *why* a particular opportunity is ranked highly for me, based on my resume and GitHub skills.
- **As a developer**, I want to cache matching results so that navigating the feed is fast and does not trigger expensive local LLM calls on every page load.
- **As a system**, I want to ingest RSS feeds and CSV/JSON mock listings, converting them to a standard database schema.

---

## Functional Requirements
1. **Opportunity Collection (Must Have):**
   - Read from RSS feeds (e.g., job boards, Devpost feeds).
   - Ingest static JSON/CSV seed data for test opportunities (Kaggle, Unstop, company pages).
   - Provide standard Python stubs for custom scrapers.
2. **Data Normalization (Must Have):**
   - Normalize listings into a single database schema: ID, title, description, skills required, provider/company, location, external URL, type (job/hackathon/project).
3. **AI Matching & Explanations (Must Have):**
   - For a given user profile, query the top matching candidate opportunities using SQL filtering (e.g., matching keywords/roles).
   - Use the local Gemma 4 E2B model (`gemma4:e2b`) to analyze the full job description against the user's profile/resume.
   - Gemma 4 E2B must output: Match Score (0-100), Match Explanation, Missing Critical Skills, and Urgency/Action items.
4. **Caching & Refresh Strategy (Should Have):**
   - Store matched opportunity calculations in Redis or Supabase caching tables.
   - Cache expires when the user's resume is re-parsed or profile is updated.
   - Daily background job updates the opportunities feed.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface Opportunity {
  id: string;
  title: string;
  company: string;
  description: string;
  type: 'job' | 'internship' | 'hackathon' | 'project';
  url: string;
  location: string;
  skillsRequired: string[];
  postedAt: string;
}

export interface OpportunityMatch {
  opportunity: Opportunity;
  score: number; // 0 to 100
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
  urgency: 'high' | 'medium' | 'low';
}

export interface OpportunityFeedResponse {
  success: boolean;
  data: OpportunityMatch[] | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime

class OpportunitySchema(BaseModel):
    id: int
    title: str
    company: str
    description: str
    opportunity_type: str  # "job", "internship", "hackathon", "project"
    url: HttpUrl
    location: str
    skills_required: List[str]
    posted_at: datetime

    class Config:
        from_attributes = True

class OpportunityMatchSchema(BaseModel):
    opportunity_id: int
    score: int = Field(..., ge=0, le=100)
    explanation: str
    matching_skills: List[str]
    missing_skills: List[str]
    urgency: str  # "high", "medium", "low"
```

---

## Gemma Integration Notes
- **Ollama Prompt for Matching:**
  ```
  You are an expert career matchmaking system.
  Compare the candidate profile with the target opportunity.
  Candidate Profile:
  - Skills: {user_skills}
  - Experience Summary: {user_experience}
  - Target Roles: {target_roles}
  - Career Memory Context: {career_memory}
  
  Target Opportunity:
  - Title: {opp_title}
  - Company: {opp_company}
  - Description: {opp_description}
  
  Evaluate the match. Provide a fit score from 0 to 100, lists of matching and missing skills, and a concise explanation highlighting specific reasons for this score.
  Format the output as a valid JSON object matching the schema below:
  {
    "score": 85,
    "explanation": "You have strong React and TypeScript experience which fits the frontend requirements. However, you lack the experience with Tailwind CSS requested by the employer.",
    "matching_skills": ["React", "TypeScript"],
    "missing_skills": ["Tailwind CSS"],
    "urgency": "high"
  }
  ```

---

## Acceptance Criteria
- [ ] Backend runs daily opportunity ingest scripts.
- [ ] Users can load the dashboard and trigger a Gemma 4 E2B-powered matching feed.
- [ ] Opportunities are ordered by match score.
- [ ] Match details show matching vs missing skills clearly with visual badges.
- [ ] Caching mechanism prevents matching logic from re-running unnecessarily on standard navigation.

---

## Edge Cases & Error Handling
- **No Matching Opportunities:** If zero opportunities pass basic keyword thresholds, return the closest roles with a low score and clear indication that the user should expand target roles.
- **Empty Job Description:** If a feed source returns an empty description, the opportunity ingestion process skips the listing or tags it as "review manually" instead of letting the local LLM analyze it.
- **Ollama Offline:** If the backend cannot establish contact with the local Ollama service (`http://localhost:11434`), log a critical error, return fallback keyword match metrics, and display a warning banner on the UI: `"Local Gemma 4 E2B model offline. Falling back to basic keyword match."`
