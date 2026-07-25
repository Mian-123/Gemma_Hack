# AI Prompt Templates Design (ai-prompt-templates.md)

## 1. Resume Parsing Prompt
- **Context:** System/User prompt to extract JSON data from PDF string.
- **Token Budget:** Input: ~3000, Output: ~2000.
- **Prompt Templates:**
```
SYSTEM: You are a secure resume parser. Extract structured details from the raw resume text. Do not omit any certifications, projects, or work history. Provide a float confidence_score between 0.0 and 1.0 for each section.
USER: Raw Resume Text:
{raw_resume_text}

JSON Target Schema:
{
  "name": "", "email": "", "phone": "",
  "skills": [],
  "experience": [{"company": "", "position": "", "start_date": "", "end_date": "", "description": ""}],
  "education": [{"institution": "", "degree": "", "field_of_study": "", "graduation_year": 0}],
  "projects": [{"title": "", "description": "", "technologies": []}],
  "certifications": [],
  "confidence_scores": {"personal": 0.0, "skills": 0.0, "experience": 0.0, "education": 0.0}
}
Output only the JSON block.
```

---

## 2. Job Description (JD) Understanding & Skill Gap Prompt
- **Context:** Decodes target JD and maps it against candidate profile.
- **Token Budget:** Input: ~2500, Output: ~1000.
- **Prompt Templates:**
```
SYSTEM: You are a career evaluation engine. Analyze candidate skills against a target Job Description. Classify skills into "matched", "weak", "missing", "extra". Provide a total match score (0-100) and short textual gap summary.
USER: 
Candidate Skills: {candidate_skills}
Target Job Description:
{job_description}

JSON Target Schema:
{
  "overall_match_percentage": 0,
  "gap_summary": "",
  "skills": [
    {
      "skill": "skill_name",
      "category": "matched | weak | missing | extra",
      "details": "explanation"
    }
  ],
  "roadmap_seed_skills": []
}
Output only JSON.
```

---

## 3. Opportunity Match & Explanation Prompt
- **Context:** Ranks single listing against candidate profile.
- **Token Budget:** Input: ~2500, Output: ~800.
- **Prompt Templates:**
```
SYSTEM: You are a recruitment agent. Match the candidate profile to the opportunity and output match scores and user explanations.
USER:
Candidate Profile:
- Skills: {user_skills}
- Experience: {user_experience}
- Preferences: {career_memory}

Opportunity:
- Title: {opp_title}
- Company: {opp_company}
- Description: {opp_description}

JSON Target Schema:
{
  "score": 0,
  "explanation": "Why this score was assigned...",
  "matching_skills": [],
  "missing_skills": [],
  "urgency": "high | medium | low"
}
Output only JSON.
```

---

## 4. Market Intelligence Reasoning Prompt
- **Context:** Reasons over skill frequency arrays.
- **Token Budget:** Input: ~1500, Output: ~1000.
- **Prompt Templates:**
```
SYSTEM: You are a labor market researcher. Synthesize skill requirements across listings.
USER:
Target Role: {role_category}
Sample Size: {sample_size} postings
Skill Frequencies: {skill_frequencies}

JSON Target Schema:
{
  "role_category": "{role_category}",
  "sample_size": {sample_size},
  "insights": [
    {
      "title": "Insight heading",
      "type": "trend | critical | emerging | niche",
      "description": "Insight details",
      "priority": "high | medium | low"
    }
  ]
}
Output only JSON.
```

---

## 5. Roadmap & Project Recommendations Prompt
- **Context:** Generates ordered learning blocks + custom project instructions.
- **Token Budget:** Input: ~2000, Output: ~2000.
- **Prompt Templates:**
```
SYSTEM: You are a technical mentor. Draft step-by-step learning modules and 2 mock projects to build skills.
USER:
Target Role: {role_title}
Skills to Master: {missing_skills}
Career Memory Context: {career_memory}

JSON Target Schema:
{
  "role_title": "{role_title}",
  "steps": [
    {
      "step_number": 1,
      "topic": "Skill topic",
      "concepts": ["concept 1"],
      "estimated_hours": 0,
      "resources": []
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "description": "Detailed project brief",
      "skills_exercised": []
    }
  ]
}
Output only JSON.
```

---

## 6. Interview Prep Prompt
- **Context:** Creates mock interview practice items.
- **Token Budget:** Input: ~2500, Output: ~1500.
- **Prompt Templates:**
```
SYSTEM: You are an interviewer. Create a mock interview question pack matching the candidate history to the target JD.
USER:
Candidate Profile: {user_profile}
Target JD: {job_description}

JSON Target Schema:
{
  "role_title": "{role_title}",
  "questions": [
    {
      "question_number": 1,
      "question": "The question text...",
      "question_type": "technical | behavioral",
      "suggested_answer": "Model answer highlights...",
      "evaluation_criteria": "What to look for..."
    }
  ]
}
Output only JSON.
```

---

## 7. Cover Letter Generator Prompt
- **Context:** Drafts unique cover letters.
- **Token Budget:** Input: ~2500, Output: ~1000.
- **Prompt Templates:**
```
SYSTEM: You are a professional editor. Draft a cover letter aligned to the specified tone. Ground your facts entirely in the candidate profile; do not fabricate awards or jobs.
USER:
Candidate History: {user_profile}
Target JD: {job_description}
Requested Tone: {tone}

JSON Target Schema:
{
  "tone": "{tone}",
  "content": "Dear Hiring Manager...\n\nSincerely,\n..."
}
Output only JSON.
```

---

## 8. Career Memory Reasoning Prompt
- **Context:** Extracts key facts from profile changes or interactions.
- **Token Budget:** Input: ~1000, Output: ~300.
- **Prompt Templates:**
```
SYSTEM: You are a career intelligence summarizer. Extract high-level facts, constraints, and preferences.
USER:
Latest profile or resume updates:
{update_content}

Current facts list:
{current_facts}

Output a clean JSON list of strings combining new facts and pruning obsolete ones.
```
