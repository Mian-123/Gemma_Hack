from pydantic import BaseModel, Field
from typing import List, Optional
from app.ai.ollama_client import ollama_client

class WorkExperienceModel(BaseModel):
    company: str = Field(..., description="Name of the company or organization")
    position: str = Field(..., description="Job title or role position")
    startDate: Optional[str] = Field(None, description="Start date of employment (YYYY-MM or YYYY)")
    endDate: Optional[str] = Field(None, description="End date of employment or null/None if current")
    description: str = Field(..., description="Summary of key tasks, achievements and systems built")

class EducationModel(BaseModel):
    institution: str = Field(..., description="Name of university, college, school or training bootcamp")
    degree: str = Field(..., description="Degree obtained (e.g. B.S., M.S., High School, Certificate)")
    fieldOfStudy: str = Field(..., description="Major field of study or focus")
    graduationYear: int = Field(..., description="Graduation completion calendar year")

class ProjectModel(BaseModel):
    title: str = Field(..., description="Name of the project")
    description: str = Field(..., description="Short explanation of project purpose and architecture")
    technologies: List[str] = Field(..., description="Programming languages, frameworks and developer libraries used")

class ConfidenceScoresModel(BaseModel):
    personal: float = Field(0.9, description="Confidence score for name, email and phone extraction (0.0 to 1.0)")
    skills: float = Field(0.85, description="Confidence score for skills extraction (0.0 to 1.0)")
    experience: float = Field(0.85, description="Confidence score for work experience extraction (0.0 to 1.0)")
    education: float = Field(0.9, description="Confidence score for education extraction (0.0 to 1.0)")

class ExtractedResumeSchema(BaseModel):
    name: str = Field(..., description="Full name of the candidate")
    email: str = Field(..., description="Email address extracted from resume contact block")
    phone: str = Field(..., description="Phone number extracted from resume contact block")
    skills: List[str] = Field(..., description="List of technical tools, programming languages and frameworks")
    experience: List[WorkExperienceModel] = Field(default=[], description="Work history details list")
    education: List[EducationModel] = Field(default=[], description="Educational background details list")
    projects: List[ProjectModel] = Field(default=[], description="Developer projects detail list")
    certifications: List[str] = Field(default=[], description="Professional certifications (e.g. AWS, Cisco, GCP)")
    confidence_scores: ConfidenceScoresModel = Field(default_factory=ConfidenceScoresModel)

def parse_resume_text(text: str) -> ExtractedResumeSchema:
    """Invokes local Gemma model via Ollama to extract structured resume details from raw text."""
    system_prompt = (
        "You are a secure resume analysis engine. Extract structured data from the raw resume text:\n"
        "skills (with proficiency signal), work experience, education, projects, certifications.\n"
        "Always respond in valid JSON matching the schema provided. If a field is uncertain or missing,\n"
        "provide sensible default values and assign a lower confidence_score (between 0.0 and 1.0) for that category."
    )
    
    prompt = (
        f"Raw resume text to analyze:\n"
        f"---BEGIN RAW RESUME---\n"
        f"{text}\n"
        f"---END RAW RESUME---\n\n"
        f"Extract all profile details and map them to the schema."
    )
    
    # Generate structured JSON matching ExtractedResumeSchema
    extracted = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=ExtractedResumeSchema
    )
    return extracted
