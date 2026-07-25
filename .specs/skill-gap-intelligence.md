# Skill Gap Intelligence Specification (skill-gap-intelligence.md)

## Overview
This specification details the Skill Gap Intelligence module of OpportunityAI. This module takes unstructured sources of user skills (parsed resume, analyzed GitHub data, user portfolios) and evaluates them against a user-supplied Job Description (JD). The local Gemma 4 E2B model (`gemma4:e2b`) extracts and compares skills, outputting a clear categorization: matched skills, weak skills (needs improvement), missing skills, and extra skills (bonus skills the candidate has that the JD doesn't require). This gap analysis serves as the direct seed for generating learning roadmaps.

---

## User Stories
- **As a candidate**, I want to paste a job description into the portal and see exactly which skills I match, which I lack, and which I need to polish.
- **As a job seeker**, I want the platform to explain why my skills are marked as "weak" or "missing" based on my professional history.
- **As a user**, I want the system to warn me if my uploaded resume is too short or lacks detail to yield a reliable gap analysis, allowing me to clarify or add skills manually.

---

## Functional Requirements
1. **Multi-Source Inputs (Must Have):**
   - Accept the user's parsed resume profile, GitHub verified skills, manual profile entries, and a pasted text block containing the Job Description.
2. **Skill Categorization (Must Have):**
   - Instruct Gemma 4 E2B to group skills into:
     - `matched`: User has proven competency matching the JD.
     - `weak`: User has some exposure but needs improvement/practice.
     - `missing`: Required by JD but completely absent in user profile.
     - `extra`: Candidate possesses these, representing added value.
3. **Match Explanation (Must Have):**
   - Provide a natural language summary explaining the gap and feasibility of preparation.
4. **Clarification Flow / Input Validation (Should Have):**
   - Calculate a text length and skill quantity metric. If inputs are too sparse, prompt the user with clarifying questions before performing analysis.
5. **Roadmap Seed (Must Have):**
   - The analysis output JSON must include a list of priority skills to learn, which acts as the source parameter for the learning roadmap.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface SkillGapItem {
  skill: string;
  category: 'matched' | 'weak' | 'missing' | 'extra';
  details: string; // e.g., "Resume highlights 1 year of Python, but JD requires senior-level FastAPI"
}

export interface SkillGapAnalysis {
  overallMatchPercentage: number;
  gapSummary: string;
  skills: SkillGapItem[];
  roadmapSeedSkills: string[];
}

export interface SkillGapResponse {
  success: boolean;
  data: SkillGapAnalysis | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, Field
from typing import List

class SkillGapItemModel(BaseModel):
    skill: str
    category: str  # "matched", "weak", "missing", "extra"
    details: str

class SkillGapAnalysisSchema(BaseModel):
    overall_match_percentage: int = Field(..., ge=0, le=100)
    gap_summary: str
    skills: List[SkillGapItemModel]
    roadmap_seed_skills: List[str]
```

---

## Gemma Integration Notes
- **Ollama Input Payload:** Structure the system prompt clearly, separating Candidate Profile, Target JD, and instructions using XML-like tags.
- **System Prompt:**
  ```
  You are an expert technical recruiter. Analyze the candidate profile and target job description below.
  
  <candidate_profile>
  {candidate_skills_and_history}
  </candidate_profile>
  
  <job_description>
  {job_description_text}
  </job_description>
  
  Perform a Skill Gap Analysis. Group every relevant skill into 'matched', 'weak', 'missing', or 'extra'. 
  Calculate an overall match percentage from 0 to 100 based on core requirements.
  Provide a list of roadmap_seed_skills that the candidate should prioritize learning to close the gap.
  
  You MUST return valid JSON matching this schema:
  {
    "overall_match_percentage": 75,
    "gap_summary": "The candidate has strong React skills but lacks PostgreSQL and Redis experience required for the backend...",
    "skills": [
      {
        "skill": "React",
        "category": "matched",
        "details": "Verified by GitHub projects and listed on resume."
      },
      {
        "skill": "PostgreSQL",
        "category": "missing",
        "details": "Required by JD, but no database skills found in user history."
      }
    ],
    "roadmap_seed_skills": ["PostgreSQL", "Redis"]
  }
  ```

---

## Acceptance Criteria
- [ ] Users can paste a job description.
- [ ] Users can trigger the gap analysis, which successfully invokes local Gemma 4 E2B (`gemma4:e2b`).
- [ ] Results show an overall match score and a visually clean dashboard categorizing skills.
- [ ] Roadmap seed skills are extracted and forwarded to the database.

---

## Edge Cases & Error Handling
- **Sparse Profile Warning:** If candidate profile skills list has fewer than 2 items, the backend raises a user exception suggesting they upload a resume or link GitHub first before running analysis.
- **Generic/Spam JDs:** If the pasted JD text is extremely short (less than 150 characters), the server returns a request error: `{ success: false, data: null, error: "Job description is too short. Please paste a full description." }`.
- **Parsing Retry:** If Gemma 4 E2B provides malformed classifications (e.g. category is "unknown" instead of the allowed set), the parsing function corrects it to "missing" or "weak" based on heuristic mapping before crashing.
