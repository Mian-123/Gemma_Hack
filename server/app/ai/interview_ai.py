from pydantic import BaseModel, Field
from typing import List
from app.ai.ollama_client import ollama_client

class InterviewQuestionModel(BaseModel):
    questionNumber: int = Field(..., description="Ordered index of the interview question")
    question: str = Field(..., description="The question text to ask")
    questionType: str = Field(..., description="Question category classification: technical or behavioral")
    suggestedAnswer: str = Field(..., description="Highlights, key tools or situational STAR points a strong response should contain")
    evaluationCriteria: str = Field(..., description="Details on what capabilities, communication skills or design patterns the interviewer should assess")

class InterviewPrepSchema(BaseModel):
    roleTitle: str = Field(..., description="The target job role category")
    questions: List[InterviewQuestionModel] = Field(default=[], description="List of compiled AI interview questions")

def generate_interview_prep(role_title: str, job_description: str, profile_data: dict) -> InterviewPrepSchema:
    """Invokes Gemma 4 E2B to draft tailored interview preparation questions matching candidate profile and job description."""
    system_prompt = (
        "You are an interview preparation generator. Generate exactly 8 interview questions (a healthy mix of technical\n"
        "and behavioral questions) tailored to the target job description and the candidate's technical profile details.\n"
        "Include suggested answer highlights and evaluation criteria for each question. Respond strictly in valid JSON matching the schema."
    )
    
    prompt = (
        f"Target Role: {role_title}\n"
        f"Job Description details:\n{job_description}\n\n"
        f"Candidate Technical Profile info:\n"
        f"Skills: {profile_data.get('skills', [])}\n"
        f"Certifications: {profile_data.get('certifications', [])}\n\n"
        f"Generate 8 structured questions."
    )
    
    interview = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=InterviewPrepSchema
    )
    return interview
