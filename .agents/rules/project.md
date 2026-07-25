---
activation: always_on
description: OpportunityAI project identity, stack, and non-negotiable build rules
---

# Identity

- Project Name: OpportunityAI — AI Opportunity Intelligence Platform
- Type: AI-powered career intelligence web app (privacy-first, local inference)
- Challenge: Gemma Hackathon — working prototype + Kaggle Writeup
- Purpose: Help students, graduates and professionals discover opportunities,
  analyse job requirements, identify skill gaps, and generate personalised
  learning roadmaps — using a locally running Gemma model so resumes and
  personal data never leave the user's machine.
- Priority: A convincingly working Gemma-powered demo > UI polish. Judges
  weight Gemma Integration and Innovation & Impact at 30% each.

# Technology Stack — DO NOT CHANGE

- Frontend: React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui,
  React Router, TanStack Query, Zustand
- Backend: FastAPI (Python 3.11+), Pydantic v2, SQLAlchemy 2.0
- Database: Supabase (managed PostgreSQL, with Storage used for resume
  file uploads), Redis (caching)
- AI: Ollama running Gemma 4 E2B (`gemma4:e2b`) locally, Sentence
  Transformers for embeddings, FAISS for optional semantic search
- AI orchestration: plain FastAPI service functions calling Ollama directly
  (no external agent framework) — implemented inside Antigravity, not a
  separate orchestration platform

# Project Folder Structure

    OpportunityAI/
    ├── client/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── layouts/
    │   │   ├── hooks/
    │   │   ├── services/
    │   │   ├── store/
    │   │   ├── types/
    │   │   └── App.tsx
    │   └── vite.config.ts
    ├── server/
    │   ├── app/
    │   │   ├── api/
    │   │   ├── ai/
    │   │   ├── auth/
    │   │   ├── crawler/
    │   │   ├── jobs/
    │   │   ├── resume/
    │   │   ├── roadmap/
    │   │   ├── market/
    │   │   ├── github/
    │   │   └── database/
    │   ├── main.py
    │   └── requirements.txt
    ├── .specs/
    ├── .design/
    ├── mock-data/
    └── README.md

# Non-Negotiable Rules

- TypeScript strict mode everywhere on the frontend. No `any` without an
  explicit comment justification.
- Every FastAPI response follows: `{ success: bool, data: T | None, error: str | None }`.
- Every route handler wrapped in try/except; a global exception handler
  formats all errors consistently.
- No hardcoded secrets. All keys in `.env`. Never commit `.env`.
- ALL resume, job-description, and profile reasoning MUST go through the
  local Gemma 4 E2B model (`gemma4:e2b`) via Ollama. No cloud LLM fallback,
  no rule-based substitute for core matching/analysis logic — this is the
  product's privacy pitch and 30% of the score.
- Gemma calls that need structured data MUST request JSON output and be
  validated against a Pydantic schema, with one automatic retry on
  malformed output before failing gracefully.
- Every AI call MUST be logged: function name, input summary, duration_ms,
  output schema — for demo transparency, not for external telemetry.
- Mock/seed data only for demo opportunities and providers where real
  scraping isn't wired up — label mock data clearly.
- Rate limiting: 20 AI requests per IP per hour on `/api/v1/ai/*` routes.
- Persistence lives in Supabase (managed Postgres + Storage): parsed
  structured profile data, opportunities, skill-gap reports, roadmaps, and
  uploaded resume files may be stored there. The privacy claim is "local
  *inference*" (no resume/JD text is ever sent to an external LLM API) —
  it is NOT "fully local storage" once Supabase is added. State this
  distinction explicitly and accurately in the Kaggle Writeup.

# Design Mandate — Frontend

| Token | Value | Use |
|---|---|---|
| Primary | `#4F46E5` (indigo) | primary actions, active states, match scores |
| Secondary | `#0F172A` (slate-950) | backgrounds, headers |
| Accent | `#F59E0B` (amber) | skill-gap warnings, urgency badges |
| Success | `#16A34A` | matched skills, strong fit |
| Error | `#DC2626` | missing skills, failures |
| Surface | `#1E293B` | cards on dark theme |
| Text Primary | `#F1F5F9` | main content |
| Text Muted | `#94A3B8` | secondary labels |
| Typography | Inter (headings/body) · JetBrains Mono (scores, IDs, JSON traces) |

Aesthetic: clean, data-forward, dark-mode-first. Resume/JD input feels like a
focused workspace, not a form wizard. Skill-gap and roadmap views should feel
like a personal dashboard, not a job board.

# Ports

- Frontend (Vite dev): `http://localhost:5173`
- Backend (FastAPI): `http://localhost:8000`
- Ollama: `http://localhost:11434`
- Supabase: hosted (project URL + keys from the Supabase dashboard, no
  local port — no local Postgres container needed)

# Definition of Done — MVP

These flows MUST work end-to-end before submission:

- User uploads a resume (PDF) → Gemma parses it into structured profile data
- User pastes a job description → Gemma performs Skill Gap Analysis
  (matching / weak / missing / extra skills + explanation)
- Gemma generates a personalised learning roadmap from the gap analysis
- Opportunity feed shows ranked opportunities with a Gemma-written match
  explanation per item
- Market Intelligence view shows skill-frequency insights across a set of
  similar listings, reasoned over by Gemma
- Every AI-generated screen visibly shows it came from the local Gemma
  model (model name/badge), not a black box
