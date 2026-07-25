# Gemma Integration Strategy (gemma-integration-strategy.md)

## 1. Local Ollama Client Configuration

The backend connects directly to the local Ollama daemon via standard HTTP calls. 
- **Ollama Base URL:** `http://localhost:11434`
- **Default Model:** `gemma4:e2b` (Ollama running Gemma 4 E2B locally)
- **Configuration Params (HTTP Client):**
  - Connect Timeout: 2.0s
  - Read Timeout: 60.0s (local inference on CPU/integrated GPU can be slow)
  - Max Retries: 3 attempts with exponential backoff on connection errors.

```python
# python code stub representing connection configuration
OLLAMA_SETTINGS = {
    "base_url": "http://localhost:11434",
    "model": "gemma4:e2b",
    "options": {
        "temperature": 0.1,  # low temperature for stable structured extraction
        "num_predict": 4096, # max output tokens
        "seed": 42
    }
}
```

---

## 2. Context Window & Token Budgeting

Gemma 4 E2B supports a native context window. To minimize execution delay on local machines, we enforce input budgeting limits:

| Call Type | Inbound Content | Max Input (Tokens) | Max Output Budget | Target Total Time (CPU/GPU) |
|---|---|---|---|---|
| **Resume Parse** | Raw Text from PDF | ~3,500 | 2,048 | 8.0s / 2.0s |
| **Skill Gap** | Resume JSON + Target JD | ~2,500 | 1,024 | 6.0s / 1.5s |
| **Roadmap** | Profile JSON + Skill Gaps | ~2,000 | 2,048 | 10.0s / 3.0s |
| **Market Intel** | Skill frequency records | ~1,500 | 1,024 | 5.0s / 1.2s |

*Budgeting Action:* Text files, JDs, and PDF extractions are automatically truncated at character limits (roughly 1 char ≈ 0.75 token) before sending.

---

## 3. Structured JSON Output & Validation Pipeline

Since OpportunityAI demands strict validation, all outputs parsed by Gemma must follow a Pydantic schema validation sequence:

```
                  +-----------------------------------+
                  |      Send Prompt to Ollama        |
                  |     (Request JSON Format)         |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |      Receive JSON String          |
                  +-----------------+-----------------+
                                    |
                                    v
                     /-----------------------------\
                    /   Parse into Pydantic model   \
                    \         Successful?           /
                     \-----------------------------/
                               /           \
                       (Yes)  /             \ (No: JSON error)
                             v               v
                   +---------+---+   +-------+-----------+
                   | Return Data |   | Trigger Auto-Retry|
                   |  Envelope   |   | (Feed back error) |
                   +-------------+   +-------+-----------+
                                             |
                                             v
                                     /---------------\
                                    /   Pydantic      \
                                   /  Retry Success?   \
                                   \-------------------/
                                       /           \
                               (Yes)  /             \ (No)
                                     v               v
                           +---------+---+   +-------+-----------+
                           | Return Data |   | Graceful Fail     |
                           |  Envelope   |   | (Empty state +    |
                           +-------------+   | friendly error)   |
                                             +-------------------+
```

---

## 4. Semantic Search (Sentence Transformers & FAISS)

To enhance basic opportunity indexing, OpportunityAI uses **Sentence Transformers** (`all-MiniLM-L6-v2`) locally to compute embeddings for:
- User skills & target roles.
- Opportunity titles & descriptions.

### Matching Mechanism
1. The backend loads the user profile, formats key skills as a vector space string.
2. Generates an embedding vector of dimension 384.
3. Performs a Cosine Similarity Search against opportunity description vectors stored in a local **FAISS (Facebook AI Similarity Search)** index.
4. Returns the top 20 candidate opportunities, which are then passed to the local Gemma 4 E2B model for the final ranked "human-style explanation" matching step.

---

## 5. Streaming vs. Blocking Endpoint Strategy

To provide an optimal UX, we divide LLM communication strategies into Streaming (SSE) and Blocking (Single Response):

### 1. Blocking Endpoints (Return single JSON payload immediately)
*Use Case: Needs structured validation before client use.*
- `POST /api/v1/resume/upload` (Pydantic schema must evaluate candidate details).
- `POST /api/v1/github/analyze` (Requires complete list parsing of repositories).
- `GET /api/v1/market/intelligence` (Requires structured analytics layout).

### 2. Streaming Endpoints (SSE streams partial completions in real-time)
*Use Case: Provides responsive "live reasoning" interface.*
- `POST /api/v1/tools/roadmap` (Streams the markdown steps and details).
- `POST /api/v1/tools/interview` (Streams the questions list as they are written).
- `POST /api/v1/tools/cover-letter` (Streams the drafting of the letter).
- `POST /api/v1/chat/reasoning` (Generic chat window displaying thinking traces).
