# Auth & Profile Specification (auth-profile.md)

## Overview
This specification details the authentication flow, session management, user profile data structures, and the privacy-first **Career Memory** system for OpportunityAI. The authentication system uses JWT tokens transmitted in headers. The Career Memory is a specialized database of user facts (e.g., "enjoys backend development", "struggles with frontend CSS styling", "wants to transition into ML engineering") that the local Gemma 4 E2B model compiles, updates, and reads across sessions to personalize career guidance.

---

## User Stories
- **As a candidate**, I want to register and log in securely so that my career data, resume, and profile details remain private and accessible only to me.
- **As a privacy-focused professional**, I want my profile details and career preferences to stay on my secure database (Supabase), and never be sent to cloud LLM providers. (Privacy claim is local inference, not local database storage).
- **As a job seeker**, I want the platform to remember facts about me (like my target roles and preferred languages) so that I do not have to repeatedly specify them in prompts.
- **As a user**, I want to edit my profile details when they conflict with parsed resume text and choose which version of the truth to use.

---

## Functional Requirements
1. **Secure Registration and Login (Must Have):**
   - Username/email and password registration.
   - Secure password hashing on the server side using bcrypt.
   - Login endpoint returning a JSON Web Token (JWT).
2. **JWT Session Handling (Must Have):**
   - Session duration of 24 hours.
   - Token must be sent in the `Authorization: Bearer <token>` HTTP header.
   - Global auth middleware on FastAPI to protect `/api/v1/*` routes (except login/register).
3. **Structured Profile Management (Must Have):**
   - Profile details containing: Education history, Target Roles, Current Location, and Preferred Programming Languages/Tech Stack.
   - Editable frontend interfaces for all fields.
4. **Career Memory System (Should Have):**
   - A dedicated key-value or list collection in the database storing atomic profile facts extracted by Gemma.
   - Whenever the user performs a resume upload, job analysis, or roadmap generation, Gemma extracts relevant facts (e.g., "Prefers remote", "Lacks Go experience") and adds/updates the Career Memory.
5. **Conflict Resolution (Could Have):**
   - If the uploaded resume contradicts the user's manual profile (e.g., different locations or target roles), the UI alerts the user and asks them which data to set as the primary source of truth.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  } | null;
  error: string | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: number;
    endYear: number | null;
  }>;
  targetRoles: string[];
  location: string;
  preferredLanguage: string;
  careerMemory: string[]; // List of facts/preferences
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSchema(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class AuthData(BaseModel):
    token: str
    user: UserSchema

# Profile Schemas
class EducationItem(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_year: int
    end_year: Optional[int] = None

class UserProfileRequest(BaseModel):
    education: List[EducationItem]
    target_roles: List[str]
    location: str
    preferred_language: str

class UserProfileSchema(BaseModel):
    id: int
    user_id: int
    education: List[EducationItem]
    target_roles: List[str]
    location: str
    preferred_language: str
    career_memory: List[str] = []
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## Gemma Integration Notes
- **Context injection:** When evaluating JDs or generating roadmaps, the backend queries the user's `career_memory` facts from Supabase and prefixes them to the Gemma prompt inside the system role context.
- **Fact Extraction Prompt:**
  ```
  You are an expert career intelligence AI.
  Analyze the user's profile, resume edits, or chat interaction below.
  Extract high-level facts, constraints, and preferences relevant to their career path (e.g., "Prefers Rust over C++", "Reluctant to work in finance", "Has 3 years of React experience").
  Format the output as a clean JSON list of strings representing these facts.
  Only output facts that are highly likely to be true and useful for career matching or roadmaps.
  ```

---

## Acceptance Criteria
- [ ] User can register and log in, receiving a valid JWT.
- [ ] Attempts to access `/api/v1/profile` without a token return `401 Unauthorized`.
- [ ] Profile can be retrieved and updated with a valid token.
- [ ] Updated profiles persist correctly in the database.
- [ ] Career Memory strings are saved to the DB and included in prompt contexts.

---

## Edge Cases & Error Handling
- **Incomplete Profile:** If the user logs in for the first time, `career_memory` is empty. The backend must default to standard prompt templates without breaking.
- **Conflicts:** If the user updates their profile location but the resume says otherwise, the backend logs a warning, but trusts the user's manually edited profile as the primary source of truth.
- **Malformed JWT:** When the client sends an expired or altered JWT, the server must intercept it with a custom security middleware and respond with a formatted JSON error: `{ success: false, data: null, error: "Signature has expired" }`.
