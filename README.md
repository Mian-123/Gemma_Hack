# OpportunityAI — AI Opportunity Intelligence Platform

OpportunityAI is a privacy-first, local inference career intelligence web app developed for the Gemma Hackathon. It helps students, graduates, and professionals discover opportunities, analyze job requirements, identify skill gaps, and generate personalized learning roadmaps using a locally running Gemma model, ensuring sensitive personal resume and target role data is not sent to external LLM APIs.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, Zustand, TanStack Query
- **Backend:** FastAPI (Python 3.11+), SQLAlchemy 2.0
- **Database & Storage:** Hosted Supabase (PostgreSQL database + Storage buckets for PDF uploads)
- **Caching:** Redis
- **AI Engine:** Local Ollama running Gemma 4 E2B (`gemma4:e2b`)
- **Semantic Search:** Sentence Transformers (`all-MiniLM-L6-v2`) and local FAISS index search

---

## Local Setup Instructions

### Prerequisites
- **Python 3.11+** installed.
- **Node.js 18+** and `npm` installed.
- **Docker Desktop** installed and running.
- **Ollama** installed locally.

### Setup Step 1: Clone and Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate the Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL`) from your Supabase Project Dashboard.

### Setup Step 2: Start Caching & Local AI
1. Run docker-compose to start Redis and Ollama:
   ```bash
   docker compose up -d
   ```
2. Pull the Gemma 4 E2B model locally:
   ```bash
   ollama pull gemma4:e2b
   ```

### Setup Step 3: Backend Setup
1. Change directory to the server:
   ```bash
   cd server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed mock opportunities to Supabase:
   ```bash
   python -m app.database.seed
   ```
5. Launch the FastAPI application:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Setup Step 4: Frontend Setup
1. Change directory to the client:
   ```bash
   cd ../client
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the web dashboard at `http://localhost:5173`.
