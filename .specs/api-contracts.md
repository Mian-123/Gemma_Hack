# API Contracts Specification (api-contracts.md)

## Overview
This specification documents the complete REST API interface for OpportunityAI. All endpoints reside under `/api/v1` and strictly return the unified envelope format: `{ success: boolean, data: T | null, error: string | null }`. Authentication is handled via standard JWT tokens passed in HTTP Authorization headers.

---

## User Stories
- **As a frontend developer**, I want a highly predictable API structure so that handling successes, validation warnings, and exceptions is consistent across all pages.
- **As a security auditor**, I want to see rate limits and authentication requirements defined for every single route.
- **As a user**, I want to see a streaming progress response for long-running AI operations so that the app feels interactive and responsive.

---

## Functional Requirements
1. **Unified API Envelope (Must Have):**
   - Every single endpoint response must conform to:
     ```json
     {
       "success": true,
       "data": { ... },
       "error": null
     }
     ```
     or
     ```json
     {
       "success": false,
       "data": null,
       "error": "Error message description"
     }
     ```
2. **JWT Authentication (Must Have):**
   - Protected routes must validate the header: `Authorization: Bearer <JWT_TOKEN>`.
3. **Multipart Resume Upload (Must Have):**
   - Route `/api/v1/resume/upload` accepts `multipart/form-data` with a `file` field containing a PDF (max 5MB).
4. **SSE Event Streaming Contract (Should Have):**
   - For long-duration AI calls (e.g., chat, roadmaps), support SSE (Server-Sent Events) streaming with format:
     `data: {"chunk": "text token"}` or `data: {"status": "processing..."}`.
5. **Rate Limiting (Must Have):**
   - Limit `/api/v1/ai/*` routes to **20 requests per IP per hour**. Return HTTP `429 Too Many Requests` on violation.

---

## Data Schemas

### TypeScript Interfaces & Endpoint Paths
```typescript
// Unified API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

// 1. AUTH ENDPOINTS
// POST /api/v1/auth/register -> ApiResponse<{ token: string, user: { id: string, email: string } }>
// POST /api/v1/auth/login    -> ApiResponse<{ token: string, user: { id: string, email: string } }>

// 2. PROFILE ENDPOINTS
// GET /api/v1/profile        -> ApiResponse<UserProfile>
// PUT /api/v1/profile        -> ApiResponse<UserProfile>

// 3. RESUME ENDPOINTS
// POST /api/v1/resume/upload -> ApiResponse<ExtractedResume>

// 4. GITHUB ENDPOINTS
// POST /api/v1/github/analyze -> ApiResponse<GitHubAnalysisResult>

// 5. OPPORTUNITY ENDPOINTS
// GET /api/v1/opportunities          -> ApiResponse<OpportunityMatch[]>
// POST /api/v1/opportunities/ingest   -> ApiResponse<{ count: number }>

// 6. SKILL GAP ENDPOINTS
// POST /api/v1/skills/gap-analysis   -> ApiResponse<SkillGapAnalysis>

// 7. MARKET INTELLIGENCE ENDPOINTS
// GET /api/v1/market/intelligence    -> ApiResponse<MarketIntelligenceReport>

// 8. ROADMAP & TOOLS ENDPOINTS
// POST /api/v1/tools/roadmap         -> ApiResponse<LearningRoadmap>
// POST /api/v1/tools/interview       -> ApiResponse<InterviewPrepSet>
// POST /api/v1/tools/cover-letter    -> ApiResponse<CoverLetterDraft>
```

### Pydantic Response Envelope
```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class ApiResponseEnvelope(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
```

---

## Gemma 4 E2B Integration Notes
- **Ollama Client Calls:** The backend calls Ollama running Gemma 4 E2B (`gemma4:e2b`) on `http://localhost:11434/api/generate` or `/api/chat` with `stream=false` (or `stream=true` mapped to SSE for interactive interfaces).
- **Execution Logging:** Every LLM call triggers a console/database log entry capturing the input summary, execution duration in milliseconds, and final token count.

---

## Acceptance Criteria
- [ ] Every API endpoint routes through a base wrapper that intercepts exceptions and enforces the response envelope schema.
- [ ] Protected endpoints return `401 Unauthorized` if the token is missing, expired, or invalid.
- [ ] Uploading file formats other than PDF or files larger than 5MB returns `400 Bad Request`.
- [ ] Rate limits on AI routes are active and return `429 Too Many Requests` when triggered.

---

## Edge Cases & Error Handling
- **Database Connection Failure:** In case the Supabase database connection fails, catch the error globally and return a structured JSON response: `{ success: false, data: null, error: "Database connection failed" }` with HTTP status `500`.
- **Validation Errors:** On pydantic validation exceptions of query or path parameters, intercept them via FastAPI's custom error handler and return `{ success: false, data: null, error: "Validation error: [field_name] is invalid" }` with HTTP status `422`.
- **Ollama Timeout:** Set the timeout on backend Ollama requests to 60 seconds. If triggered, return a structured `504 Gateway Timeout` envelope: `{ success: false, data: null, error: "Local AI model took too long to respond. Please retry." }`.
