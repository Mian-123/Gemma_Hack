# Roadmap & Career Tools Specification (roadmap-career-tools.md)

## Overview
This specification details the suite of personalized career tools provided by OpportunityAI: the **Learning Roadmap Generator**, the **Interview Prep Generator**, and the **Cover Letter Generator**. All three modules read the user's **Career Memory** to align recommendations with past achievements, preferences, and progress.

---

## User Stories
- **As a user**, I want to generate a step-by-step roadmap from my skill gap analysis, complete with real-world practice project ideas.
- **As a candidate**, I want to generate a list of practice interview questions and answers specific to a target job description and my resume context.
- **As an applicant**, I want to draft a customized cover letter for a job description, choosing between different tones (e.g., Professional, Technical, Enthusiastic).
- **As a user**, I want these tools to remember my previous progress and preferences (from Career Memory) so they grow with me.

---

## Functional Requirements
1. **Learning Roadmap Generator (Must Have):**
   - Take priority missing/weak skills (roadmap seed) as input.
   - Generate ordered steps/modules for learning (each containing: Topic, Key Concepts, Est. Time, and Suggested Resources).
   - Generate 1-2 practical, local coding project ideas designed to prove the newly learned skills.
2. **Interview Prep Generator (Must Have):**
   - Accept a JD and User Profile.
   - Generate a set of 5 tailored interview questions: 3 technical/role-specific, and 2 behavioral.
   - Provide detailed sample answers and "what the interviewer is looking for" insights.
3. **Cover Letter Generator (Must Have):**
   - Accept a JD and User Profile.
   - Offer three tone options: "Technical/Direct", "Professional/Balanced", and "Enthusiastic/Startup".
   - Generate a complete cover letter that highlights matching skills from the user's history and explains gaps positively.
4. **Career Memory Sync (Should Have):**
   - Every time a tool is run, update the user's Career Memory (e.g. "Drafted technical cover letter for Go role", "Began learning Docker").

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
// Roadmap Interfaces
export interface RoadmapStep {
  stepNumber: number;
  topic: string;
  concepts: string[];
  estimatedHours: number;
  resources: string[];
}

export interface PracticeProject {
  title: string;
  description: string;
  skillsExercised: string[];
}

export interface LearningRoadmap {
  roleTitle: string;
  steps: RoadmapStep[];
  projects: PracticeProject[];
}

// Interview Interfaces
export interface InterviewQuestion {
  questionNumber: number;
  question: string;
  type: 'technical' | 'behavioral';
  suggestedAnswer: string;
  evaluationCriteria: string;
}

export interface InterviewPrepSet {
  roleTitle: string;
  questions: InterviewQuestion[];
}

// Cover Letter Interface
export interface CoverLetterDraft {
  tone: 'technical' | 'professional' | 'enthusiastic';
  content: string;
}

export interface RoadmapResponse { success: boolean; data: LearningRoadmap | null; error: string | null; }
export interface InterviewResponse { success: boolean; data: InterviewPrepSet | null; error: string | null; }
export interface CoverLetterResponse { success: boolean; data: CoverLetterDraft | null; error: string | null; }
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel
from typing import List

# Roadmap Pydantic Models
class RoadmapStepModel(BaseModel):
    step_number: int
    topic: str
    concepts: List[str]
    estimated_hours: int
    resources: List[str]

class PracticeProjectModel(BaseModel):
    title: str
    description: str
    skills_exercised: List[str]

class LearningRoadmapSchema(BaseModel):
    role_title: str
    steps: List[RoadmapStepModel]
    projects: List[PracticeProjectModel]

# Interview Pydantic Models
class InterviewQuestionModel(BaseModel):
    question_number: int
    question: str
    question_type: str  # "technical" or "behavioral"
    suggested_answer: str
    evaluation_criteria: str

class InterviewPrepSchema(BaseModel):
    role_title: str
    questions: List[InterviewQuestionModel]

# Cover Letter Pydantic Model
class CoverLetterSchema(BaseModel):
    tone: str
    content: str
```

---

## Gemma 4 E2B Integration Notes
- **Injecting Career Memory:** For all tools, load the `career_memory` array and add it to the LLM prompt inside a `<career_memory>` XML block.
- **Roadmap Prompt:**
  ```
  You are an expert curriculum developer. 
  Create a learning roadmap to help the candidate master: {missing_skills}.
  Candidate context: {user_profile_summary}.
  Career Memory: {career_memory}.
  
  Generate an ordered set of learning steps and 2 coding projects. Output ONLY JSON:
  {
    "role_title": "{role_title}",
    "steps": [
      {
        "step_number": 1,
        "topic": "Docker Basics",
        "concepts": ["Containers vs VMs", "Dockerfile", "Docker CLI"],
        "estimated_hours": 6,
        "resources": ["Docker official docs", "FreeCodeCamp Docker guide"]
      }
    ],
    "projects": [
      {
        "title": "Dockerized Multi-service CRUD App",
        "description": "Create a simple Python Flask API backend connected to a Supabase PostgreSQL database.",
        "skills_exercised": ["Docker", "Supabase", "PostgreSQL"]
      }
    ]
  }
  ```

---

## Acceptance Criteria
- [ ] User can generate roadmaps, interview prep sets, and cover letters.
- [ ] All generators execute locally via Ollama with strict JSON outputs validated by Pydantic.
- [ ] UI provides tone selector buttons for cover letter generation.
- [ ] Career memory updates upon successful generation events.

---

## Edge Cases & Error Handling
- **Too Many Missing Skills:** If the skill gap lists more than 10 missing skills, the backend prioritizes the top 3 core technical skills for the first version of the roadmap to avoid overloading the user (and LLM context).
- **Generic Cover Letters:** If the user profile lacks experience descriptions, Gemma 4 E2B drafts a template-style cover letter, flagging placeholders (e.g. `[Insert Achievement]`) for the user to edit manually.
- **Timeouts on Roadmap Generation:** Generating a comprehensive roadmap can take up to 10 seconds locally. The API uses a loading state and long read timeout settings (30 seconds) on local HTTP calls to Ollama.
