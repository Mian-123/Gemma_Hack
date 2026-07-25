# Resume Parser Specification (resume-parser.md)

## Overview
This specification details the parser module responsible for extracting unstructured text from uploaded PDF resumes and using the local Gemma 4 E2B model (`gemma4:e2b`) to parse it into structured JSON profiles. To ensure privacy, all PDF text extraction and LLM structuring run locally.

---

## User Stories
- **As a user**, I want to upload my resume in PDF format so that the system automatically populates my education, skills, and work history.
- **As a developer**, I want the local Gemma 4 E2B model to output clean, structured JSON containing the parsed resume data.
- **As a security-conscious user**, I want to be 100% sure my resume content is never uploaded to external cloud LLM APIs.
- **As a user**, I want to review the confidence rating of the extracted fields and easily correct any inaccuracies in a user-friendly form, triggering a re-parse or merge if needed.

---

## Functional Requirements
1. **PDF Text Extraction & Upload (Must Have):**
   - Accept PDF file uploads via HTTP multipart.
   - Upload the raw PDF to Supabase Storage in the `resumes` bucket.
   - Extract raw text using a local Python library (such as PyPDF or pdfplumber).
2. **Gemma Structured Parsing (Must Have):**
   - Inject raw resume text into a Gemma 4 E2B system prompt.
   - Instruct Gemma to parse details into: personal info, skills (categorized), experience, education, projects, and certifications.
   - Use JSON mode in Ollama.
3. **Confidence Scoring (Should Have):**
   - Prompt Gemma to output a confidence rating (0.0 to 1.0) for each major section based on text clarity and extraction quality.
4. **OCR Fallback (Could Have):**
   - If the extracted text from PDF is extremely short (suggesting a scanned image), run a lightweight local OCR engine (such as pytesseract) or report a clear warning to the user.
5. **Validation and Retry (Must Have):**
   - Validate Gemma's output JSON against a Pydantic schema.
   - On validation failure, retry the prompt once, providing the error message back to Gemma before failing gracefully.

---

## Data Schemas

### TypeScript Interfaces (Frontend)
```typescript
export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
}

export interface ExtractedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  confidenceScores: {
    personal: number;
    skills: number;
    experience: number;
    education: number;
  };
}

export interface ResumeParseResponse {
  success: boolean;
  data: ExtractedResume | null;
  error: string | null;
}
```

### Pydantic Models (Backend)
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class WorkExperienceModel(BaseModel):
    company: str
    position: str
    start_date: str
    end_date: Optional[str] = None
    description: str

class EducationModel(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    graduation_year: int

class ProjectModel(BaseModel):
    title: str
    description: str
    technologies: List[str]

class ConfidenceScoresModel(BaseModel):
    personal: float = Field(..., ge=0.0, le=1.0)
    skills: float = Field(..., ge=0.0, le=1.0)
    experience: float = Field(..., ge=0.0, le=1.0)
    education: float = Field(..., ge=0.0, le=1.0)

class ExtractedResumeSchema(BaseModel):
    name: str
    email: str
    phone: str
    skills: List[str]
    experience: List[WorkExperienceModel]
    education: List[EducationModel]
    projects: List[ProjectModel]
    certifications: List[str]
    confidence_scores: ConfidenceScoresModel
```

---

## Gemma Integration Notes
- **Ollama Configuration:** Set temperature to `0.0` or `0.1` to maximize accuracy, and request JSON format.
- **System Prompt:**
  ```
  You are a professional resume parsing engine. Your job is to extract resume data from raw text.
  You MUST return ONLY a valid JSON object matching the requested schema. Do not output conversational filler.
  
  Required Schema Structure:
  {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "skills": ["Skill 1", "Skill 2"],
    "experience": [{"company": "Co Name", "position": "Title", "start_date": "YYYY-MM", "end_date": "YYYY-MM", "description": "Bullet points"}],
    "education": [{"institution": "Univ Name", "degree": "Degree Type", "field_of_study": "Major", "graduation_year": YYYY}],
    "projects": [{"title": "Proj Title", "description": "Proj desc", "technologies": ["React", "Python"]}],
    "certifications": ["Cert 1"],
    "confidence_scores": {
      "personal": 0.9,
      "skills": 0.8,
      "experience": 0.9,
      "education": 0.95
    }
  }
  
  Evaluate the clarity and presence of data in each section to provide the float confidence_scores (between 0.0 and 1.0).
  ```

---

## Acceptance Criteria
- [ ] Users can upload a resume in PDF format.
- [ ] Server extracts text locally and passes it to Ollama running Gemma 4 E2B (`gemma4:e2b`).
- [ ] Backend validates that the parsed output conforms to the Pydantic schema.
- [ ] Confident scores are returned to the user alongside parsed details.
- [ ] Frontend renders the parsed details in a form that allows manual adjustments.

---

## Edge Cases & Error Handling
- **Scanned/Unreadable PDF:** If no text can be extracted, prompt the user with a message indicating the document could not be read (e.g., scanned image or password protection).
- **JSON Validation Failures:** In case of malformed JSON from Gemma, catch the error and execute one retry. The retry prompt must append: `Your previous response failed validation with error: {error}. Please correct the formatting and supply only valid JSON.`
- **Huge Resume Files:** PDF uploads are capped at 5MB to prevent memory exhaustion and excessive local LLM latency.
