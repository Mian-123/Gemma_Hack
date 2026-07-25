# GitHub Analyzer Specification (github-analyzer.md)

## Overview
This specification details the GitHub Analyzer component of OpportunityAI. This module connects to a user's GitHub profile, collects public repository metadata, and uses the local Gemma 4 E2B model (`gemma4:e2b`) to analyze the codebase characteristics (languages, commit activity, README quality, code patterns) to infer practical skill levels. The resulting insights are merged with the resume-derived profile.

---

## User Stories
- **As a developer**, I want to link my public GitHub profile to the app so that my actual coding projects and languages are analyzed automatically.
- **As a user**, I want the AI to look at my project READMEs to deduce my writing, documentation, and system design abilities.
- **As a user**, I want GitHub-derived skills to be intelligently merged with my resume so that my profile accurately represents my practical achievements.
- **As a system builder**, I want to query public GitHub profiles safely without crashing when reaching GitHub API rate limits.

---

## Functional Requirements
1. **GitHub Metadata Collection (Must Have):**
   - Accept either a GitHub username (public API access) or OAuth token.
   - Fetch up to 10 repositories (prioritizing pinned/popular repos).
   - Collect repository language distribution, star counts, commit activity counts (last 12 months), and raw README markdown contents.
2. **Gemma Skill Inference (Must Have):**
   - Inject repository details (languages, size, description, README excerpts) into Gemma 4 E2B.
   - Instruct Gemma 4 E2B to infer skill proficiencies (e.g., "Advanced TypeScript", "Intermediate Docker", "Strong technical documentation").
3. **Skill Merging Logic (Must Have):**
   - Combine resume-derived skills with GitHub-derived skills.
   - GitHub skills add weight and evidence to existing skills (e.g., "React (Verified by 3 GitHub repos)").
4. **Rate Limit Management (Must Have):**
   - Implement exponential backoff for GitHub API requests.
   - Gracefully fallback to a friendly user prompt if the API limit is hit, asking the user to wait or provide a personal access token.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface GitHubRepoSummary {
  name: string;
  url: string;
  languages: Record<string, number>;
  stars: number;
  lastUpdated: string;
}

export interface InferredSkill {
  name: string;
  confidence: 'strong' | 'moderate' | 'weak';
  evidence: string;
}

export interface GitHubAnalysisResult {
  username: string;
  repos: GitHubRepoSummary[];
  inferredSkills: InferredSkill[];
}

export interface GitHubAnalysisResponse {
  success: boolean;
  data: GitHubAnalysisResult | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, HttpUrl
from typing import List, Dict

class GitHubRepoSummaryModel(BaseModel):
    name: str
    url: HttpUrl
    languages: Dict[str, int]
    stars: int
    last_updated: str

class InferredSkillModel(BaseModel):
    name: str
    confidence: str  # "strong" | "moderate" | "weak"
    evidence: str

class GitHubAnalysisSchema(BaseModel):
    username: str
    repos: List[GitHubRepoSummaryModel]
    inferred_skills: List[InferredSkillModel]
```

---

## Gemma Integration Notes
- **Context Construction:** To stay within context windows and reduce latency, clean the repository README contents of HTML and image tags, and crop to the first 1500 characters before sending to Gemma 4 E2B.
- **System Prompt:**
  ```
  You are an experienced technical evaluator.
  Analyze the following GitHub repository list and README texts for user: {username}.
  Infer technical competencies, design skills, documentation quality, and tool proficiencies.
  Provide structured JSON detailing the skill name, confidence, and a brief description of the evidence (e.g., "Used Docker and docker-compose in 3 repos; structured README highlights configuration").
  
  Only output valid JSON matching this schema:
  {
    "username": "...",
    "repos": [...],
    "inferred_skills": [
      {
        "name": "Docker",
        "confidence": "strong",
        "evidence": "Configured multi-container environments in 'webapp-demo'"
      }
    ]
  }
  ```

---

## Acceptance Criteria
- [ ] Users can enter a GitHub username or authenticate via OAuth.
- [ ] System collects repository statistics and READMEs.
- [ ] Gemma 4 E2B analyses the repository data and returns a structured JSON payload of skills with evidence.
- [ ] Inferred skills are displayed on the user's dashboard with a "GitHub verified" badge and specific evidence.
- [ ] Rate limits do not cause server 500 errors.

---

## Edge Cases & Error Handling
- **No Repositories or Empty Profile:** If the user has zero public repositories, return an empty analysis state gracefully instead of failing.
- **GitHub API Rate Limit:** When receiving a `403 Forbidden` with header `X-RateLimit-Remaining: 0`, catch the exception and return a structured JSON response: `{ success: false, data: null, error: "GitHub rate limit exceeded. Please try again later or add an access token." }`.
- **Extremely Large READMEs:** Truncate all README files before sending to Gemma 4 E2B to protect local LLM token context limits.
