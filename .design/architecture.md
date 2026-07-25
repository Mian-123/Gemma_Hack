# System Architecture Design (architecture.md)

## 1. System Architecture Diagram

```
                 +---------------------------------------+
                 |          React 19 Frontend            |
                 |      Vite + TS + Tailwind CSS         |
                 +-------------------+-------------------+
                                     |
                                     | (REST APIs, SSE, File Uploads)
                                     v
                 +-------------------+-------------------+
                 |           FastAPI Backend             |
                 |     Port 8000, Auth Middleware        |
                 +--------+-------+---------------+-------+
                          |       |               |
             (SQLAlchemy) |       | (Redis Cache) | (HTTP Ollama)
                          v       v               v
                 +--------+---+ +-+--------+    +-+-----------+
                 |  Supabase  | |  Redis   |    |   Ollama    |
                 | Hosted DB  | | Cache/QL |    | Gemma 4 E2B |
                 |  & Storage | +----------+    | (gemma4:e2b)|
                 +------------+                 +-------------+
```

---

## 2. Component Data Flow

### Scenario: User Uploads Resume & Gets Parse Results

```
[Client]                      [FastAPI]                   [Supabase Storage/DB]        [Ollama (Gemma 4 E2B)]
   |                              |                            |                              |
   |-- 1. POST /resume/upload --->|                            |                              |
   |   (Multipart PDF File)       |                            |                              |
   |                              |-- 2. Store PDF in Storage->|                              |
   |                              |                            |                              |
   |                              |-- 3. Extract raw text ---->|                              |
   |                              |                            |                              |
   |                              |-- 4. Construct prompt ----------------------------------->|
   |                              |    (Raw Text + System Rules)                              |
   |                              |<-- 5. Returns JSON (Profile data) ------------------------|
   |                              |                                                           |
   |                              |-- 6. Save JSON to DB ----->|                              |
   |                              |                            |                              |
   |<-- 7. Returns 200 JSON ------|                            |                              |
   |   (Unified response env)     |                            |                              |
```

### Scenario: Live Reasoning Chat / Roadmap Generation (SSE Stream)

```
[Client]                      [FastAPI]                     [Redis]                [Ollama (Gemma 4 E2B)]
   |                              |                            |                              |
   |-- 1. POST /tools/roadmap --->|                            |                              |
   |   (Request Body + Token)     |                            |                              |
   |                              |-- 2. Check Cache --------->|                              |
   |                              |    (Miss: cache empty)     |                              |
   |                              |                                                           |
   |                              |-- 3. Stream Prompt (stream=true) ------------------------>|
   |                              |                                                           |
   |-- 4. Establish SSE Conn ---->|                                                           |
   |<-- 5. Send SSE Stream -------|<-- 6. Stream chunk ---------------------------------------|
   |    data: {"chunk": "..."}    |                                                           |
   |                              |                                                           |
   |<-- 7. End SSE Connection ----|<-- 8. Complete response ----------------------------------|
   |                              |                                                           |
   |                              |-- 9. Cache Roadmap Results ->|                            |
```

---

## 3. Deployment Topology & Local Dev Environment

### Local Development (`docker-compose.yml` topology)
In local development, the backend and caching services are run side-by-side. Ollama pulls and serves the Gemma 4 E2B model locally. Persisted data and files are hosted remotely on Supabase.

```
       +--------------------------------------------+
       |             docker-compose                 |
       |                                            |
       |  +-------------+                           |
       |  |   backend   | --------------------+     |
       |  | (FastAPI)   |                     |     |
       |  +----+---+----+                     |     |
       |       |   |                          |     |
       |       |   +----------> +-------------+     |
       |       |                |    redis    |     |
       |       |                |  (Port 6379)|     |
       |       v                +-------------+     |
       |  +-------------+                           |
       |  |   ollama    | (Pulls and hosts          |
       |  | (Port 11434)|  gemma4:e2b model)        |
       |  +-------------+                           |
       +-------|------------------------------------+
               | (External network request)
               v
       +--------------------------------------------+
       |         Supabase Hosted Cloud              |
       |    - Managed PostgreSQL Database            |
       |    - Storage Buckets (Resumes)             |
       +--------------------------------------------+
```

### Production Deployment (Privacy-First Hybrid Cloud)
If deployed to a cloud environment (e.g. AWS or GCP), privacy is maintained by deploying the model to a dedicated private GPU node (EC2 or GCP VM running Ollama/vLLM) in a secure VPC, ensuring no third-party cloud LLM APIs process the user's resumes or data.

- **Vercel**: Hosts the React 19 static client.
- **Render/ECS**: Runs the FastAPI backend in a private subnet.
- **Supabase**: Managed PostgreSQL database & file Storage.
- **AWS ElastiCache Redis / Upstash Redis**: Managed caching layer.
- **Private GPU Instance**: VM running Ollama within the same secure VPC.
