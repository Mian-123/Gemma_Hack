# Market Intelligence Specification (market-intelligence.md)

## Overview
This specification details the Market Intelligence module. Instead of looking at a single job description, the system aggregates all collected opportunities (jobs, internships, hackathons) belonging to a specific role category (e.g., "Fullstack Engineer", "Data Scientist"). It calculates the frequency of demanded skills and uses the local Gemma 4 E2B model (`gemma4:e2b`) to analyze this structured distribution data, outputting ranked market insights, trends, and recommendations.

---

## User Stories
- **As a student**, I want to see a market overview for my target role (e.g. "React Developer") so I can focus on learning the technologies that are most frequently requested in actual postings.
- **As a user**, I want to read high-level, AI-written analysis explaining *why* certain tools are rising in popularity or what secondary skills give candidates a competitive edge.
- **As a developer**, I want to prevent inaccurate, low-sample trends by ensuring a minimum number of postings are parsed before showing statistical insights.

---

## Functional Requirements
1. **Skill Frequency Aggregation (Must Have):**
   - Query the opportunities database for a specific role category or keyword.
   - Parse and count the occurrence of tagged skills across matching JDs.
   - Output a list of skills sorted by frequency percentage (e.g., Python: 85%, Docker: 45%).
2. **Minimum Sample Size constraint (Must Have):**
   - Require at least **10 unique opportunities** in the database for the given category before running the intelligence report.
   - If the database contains fewer than the threshold, show a friendly placeholder screen prompting the user to fetch/ingest more listings.
3. **Gemma 4 E2B Analysis & Market Insights (Must Have):**
   - Provide Gemma 4 E2B with the aggregated list of roles, titles, and skill frequencies.
   - Gemma 4 E2B must generate high-level takeaways (e.g., "Docker is emerging as a critical infrastructure requirement, showing up in 45% of listings").
   - Gemma 4 E2B must recommend specific target certifications or library specializations.
4. **Structured JSON Output (Must Have):**
   - Gemma 4 E2B must return structured JSON list items consisting of the insight type, priority, and text description.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface MarketSkillMetric {
  skillName: string;
  frequencyPercentage: number; // e.g. 85 for 85%
  count: number;
}

export interface MarketInsightItem {
  title: string;
  type: 'trend' | 'critical' | 'emerging' | 'niche';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MarketIntelligenceReport {
  roleCategory: string;
  sampleSize: number;
  topSkills: MarketSkillMetric[];
  insights: MarketInsightItem[];
  generatedAt: string;
}

export interface MarketIntelligenceResponse {
  success: boolean;
  data: MarketIntelligenceReport | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, Field
from typing import List

class MarketSkillMetricModel(BaseModel):
    skill_name: str
    frequency_percentage: float = Field(..., ge=0.0, le=100.0)
    count: int

class MarketInsightItemModel(BaseModel):
    title: str
    type: str  # "trend", "critical", "emerging", "niche"
    description: str
    priority: str  # "high", "medium", "low"

class MarketIntelligenceReportSchema(BaseModel):
    role_category: str
    sample_size: int
    top_skills: List[MarketSkillMetricModel]
    insights: List[MarketInsightItemModel]
```

---

## Gemma Integration Notes
- **Prompt Structure:** Keep inputs concise. Send only the frequency rankings (top 15 skills) and the role title, rather than sending full job descriptions.
- **System Prompt:**
  ```
  You are an expert labor market analyst.
  Review the aggregated skill frequency data for the role category: '{role_category}'.
  Total listings analyzed: {sample_size}.
  
  Aggregated Skill Frequencies:
  {skill_frequencies}
  
  Generate a set of 3 to 5 clear market insights. Classify them into 'critical' (must-have skills), 'emerging' (growing in demand), 'trend' (general industry direction), or 'niche' (highly valued in specific postings).
  Explain the practical implications for a job seeker.
  
  Return ONLY JSON matching the following structure:
  {
    "role_category": "{role_category}",
    "sample_size": {sample_size},
    "insights": [
      {
        "title": "Docker Containerization dominance",
        "type": "critical",
        "description": "Docker appears in 92% of matching listings. Familiarity with container workflows is no longer optional for this role.",
        "priority": "high"
      }
    ]
  }
  ```

---

## Acceptance Criteria
- [ ] Backend blocks requests when less than 10 listings exist for a role category.
- [ ] Statistics calculate correctly in SQL (counts and percentages).
- [ ] Gemma 4 E2B analyses frequencies and outputs formatted insights JSON.
- [ ] Dashboard displays a chart of top skills alongside AI insights.

---

## Edge Cases & Error Handling
- **Low Sample Size Handling:** Return code `200` but with `{ success: true, data: null, error: "Insufficient data: Need at least 10 opportunities for this role category (Currently: 3)." }`.
- **Nonsense Category Input:** If a user searches for an invalid role category (e.g. "asdfasdf"), and there are zero matching listings, return a clean error indicating no matching listings could be found.
- **Ties in Skill Counts:** If multiple skills share the exact same frequency, sorting logic must resolve alphabetically or by database insertion order to ensure consistent prompt payloads.
