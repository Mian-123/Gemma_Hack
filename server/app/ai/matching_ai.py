from pydantic import BaseModel, Field
from typing import List
from app.ai.ollama_client import ollama_client

class OpportunityMatchSchema(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Match score from 0 to 100 representing fit compatibility")
    explanation: str = Field(..., description="A concise, one-sentence explanation of the candidate's fit for this opportunity")
    matchingSkills: List[str] = Field(default=[], description="Skills candidate has that are required by the opportunity")
    missingSkills: List[str] = Field(default=[], description="Skills candidate is missing that are required by the opportunity")
    urgency: str = Field("medium", description="Urgency priority classification: high, medium, or low")

def evaluate_opportunity_fit(profile_data: dict, opportunity_data: dict) -> OpportunityMatchSchema:
    """Invokes Gemma 4 E2B to evaluate how well a candidate fits a specific job/internship listing."""
    system_prompt = (
        "You are an opportunity evaluation engine. Given a candidate profile and a single job/internship opportunity's details,\n"
        "score the compatibility fit (0 to 100), identify matching/missing skills, classify the urgency, and write a simple\n"
        "one-sentence explanation of the fit. Respond strictly in valid JSON matching the schema provided."
    )
    
    prompt = (
        f"Candidate Profile Info:\n"
        f"Skills: {profile_data.get('skills', [])}\n"
        f"Preferred Language: {profile_data.get('preferred_language', '')}\n\n"
        f"Opportunity Details:\n"
        f"Title: {opportunity_data.get('title')}\n"
        f"Company: {opportunity_data.get('company')}\n"
        f"Required Skills: {opportunity_data.get('skillsRequired', [])}\n"
        f"Description: {opportunity_data.get('description')}\n"
    )
    
    match_result = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=OpportunityMatchSchema
    )
    return match_result
