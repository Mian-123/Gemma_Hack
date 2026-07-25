-- ============================================================
-- OpportunityAI — Supabase Schema Setup SQL
-- Run this entire script in:
--   Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    education           JSONB DEFAULT '[]'::jsonb NOT NULL,
    target_roles        JSONB DEFAULT '[]'::jsonb NOT NULL,
    location            VARCHAR(255) DEFAULT '' NOT NULL,
    preferred_language  VARCHAR(50)  DEFAULT 'Python' NOT NULL,
    career_memory       JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── RESUMES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    storage_path    VARCHAR(512) NOT NULL,
    extracted_text  TEXT NOT NULL,
    parsed_json     JSONB DEFAULT '{}'::jsonb NOT NULL,
    confidence_scores JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── GITHUB PROFILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS github_profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username        VARCHAR(100) NOT NULL,
    repos           JSONB DEFAULT '[]'::jsonb NOT NULL,
    inferred_skills JSONB DEFAULT '[]'::jsonb NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── OPPORTUNITIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunities (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    company          VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    opportunity_type VARCHAR(50)  NOT NULL,   -- job | internship | hackathon | project
    url              VARCHAR(512) NOT NULL,
    location         VARCHAR(255) NOT NULL,
    skills_required  JSONB DEFAULT '[]'::jsonb NOT NULL,
    posted_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── SKILL GAP REPORTS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_gap_reports (
    id                       SERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_description          TEXT NOT NULL,
    overall_match_percentage INTEGER NOT NULL,
    gap_summary              TEXT NOT NULL,
    skills                   JSONB DEFAULT '[]'::jsonb NOT NULL,
    roadmap_seed_skills      JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── ROADMAPS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_gap_report_id INTEGER REFERENCES skill_gap_reports(id) ON DELETE SET NULL,
    role_title          VARCHAR(255) NOT NULL,
    steps               JSONB DEFAULT '[]'::jsonb NOT NULL,
    projects            JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── AI CALL LOGS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_call_logs (
    id            SERIAL PRIMARY KEY,
    function_name VARCHAR(100) NOT NULL,
    input_summary TEXT NOT NULL,
    duration_ms   INTEGER NOT NULL,
    output_schema VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── INDEXES (performance) ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_resumes_user_id          ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gap_reports_user   ON skill_gap_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id         ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type       ON opportunities(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_created_at  ON ai_call_logs(created_at DESC);

-- ── ROW LEVEL SECURITY (RLS) ──────────────────────────────────
-- Enable RLS on all user-scoped tables so users can only see their own data.
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps          ENABLE ROW LEVEL SECURITY;

-- NOTE: We use JWT auth via our own FastAPI backend (not Supabase Auth).
-- RLS policies below are for direct Supabase client access (e.g. Storage).
-- The backend service-role key bypasses RLS for server-side operations.

-- ── STORAGE BUCKET ────────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New Bucket
-- Name: resumes
-- Public: false (private)
-- Max file size: 5 MB
-- Allowed MIME types: application/pdf

-- ============================================================
-- DONE. Your Supabase schema is ready.
-- Now fill in your .env file with the values from:
--   Supabase Dashboard → Settings → API
--   Supabase Dashboard → Settings → Database → Connection string
-- ============================================================
