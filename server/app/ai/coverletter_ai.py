from pydantic import BaseModel, Field
from app.ai.ollama_client import ollama_client

class CoverLetterSchema(BaseModel):
    subject: str = Field(..., description="Formal email or print subject line")
    body: str = Field(..., description="Draft body text of the cover letter, grounded strictly in facts from candidate resume")

def generate_cover_letter(role_title: str, job_description: str, profile_data: dict, tone: str = "formal") -> CoverLetterSchema:
    """Invokes Gemma 4 E2B to compose a custom cover letter grounded strictly in candidate profile facts without hallucinating experience."""
    system_prompt = (
        "You are a professional resume writer. Write a concise, specific cover letter grounded ONLY in the candidate's actual profile\n"
        "and the target job description. Do not invent experience or add fake metrics. Respect the requested tone parameter.\n"
        "Respond strictly in valid JSON matching the schema provided."
    )
    
    prompt = (
        f"Target Role: {role_title}\n"
        f"Requested Tone: {tone}\n"
        f"Job Description details:\n{job_description}\n\n"
        f"Candidate Actual Resume Facts:\n"
        f"Name: {profile_data.get('name', 'Candidate')}\n"
        f"Email: {profile_data.get('email', '')}\n"
        f"Skills: {profile_data.get('skills', [])}\n"
        f"Experience Summary: {profile_data.get('experience', [])}\n\n"
        f"Draft a compelling subject line and 3-paragraph body text."
    )
    
    cover_letter = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=CoverLetterSchema
    )
    return cover_letter
