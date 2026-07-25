from pydantic import BaseModel, Field
from typing import List
from app.ai.ollama_client import ollama_client

class MarketInsightItemModel(BaseModel):
    title: str = Field(..., description="Title of the market trend or insight")
    type: str = Field(..., description="Classification: trend, critical, emerging, or niche")
    description: str = Field(..., description="Human-readable explanation of why this skill/trend matters and its impact")
    priority: str = Field("medium", description="Priority level: high, medium, or low")

class MarketInsightsListSchema(BaseModel):
    insights: List[MarketInsightItemModel] = Field(default=[], description="List of compiled AI labor insights")

def generate_market_insights(role_category: str, sample_size: int, top_skills: List[dict]) -> MarketInsightsListSchema:
    """Invokes Gemma 4 E2B to reason about labor trends given a counted skill frequency table."""
    system_prompt = (
        "You are an expert labor market analyst. Review the aggregated skill frequency data for a specific role.\n"
        "Generate a set of 3 to 4 clear market insights. Classify them into 'critical' (must-have skills),\n"
        "'emerging' (growing in demand), 'trend' (general industry direction), or 'niche' (highly valued in specific postings).\n"
        "Explain the practical implications for a job seeker. Respond strictly in valid JSON matching the schema provided."
    )
    
    # Format the counted frequencies table for Gemma input
    frequencies_text = ""
    for idx, skill in enumerate(top_skills):
        frequencies_text += f"{idx+1}. {skill['skillName']}: requested in {skill['count']} listings ({skill['frequencyPercentage']}%)\n"
        
    prompt = (
        f"Role Category: {role_category}\n"
        f"Total Listings Analyzed: {sample_size}\n\n"
        f"Aggregated Skill Frequencies Table:\n"
        f"{frequencies_text}\n"
        f"Generate 3 insights explaining candidate market advantages."
    )
    
    insights = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=MarketInsightsListSchema
    )
    return insights
