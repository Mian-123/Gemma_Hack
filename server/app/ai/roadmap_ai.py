from pydantic import BaseModel, Field
from typing import List
from app.ai.ollama_client import ollama_client

class RoadmapStepModel(BaseModel):
    stepNumber: int = Field(..., description="Ordered step index starting at 1")
    topic: str = Field(..., description="The technology or conceptual topic to learn")
    concepts: List[str] = Field(..., description="Core sub-concepts and library tools to focus on")
    estimatedHours: int = Field(..., description="Estimated hours of focused learning required")
    resources: List[str] = Field(..., description="List of reference titles, documentation links or guide types")

class PracticeProjectModel(BaseModel):
    title: str = Field(..., description="Title of the practice coding project")
    description: str = Field(..., description="Detailed instructions on what application or system to build")
    skillsExercised: List[str] = Field(..., description="Skills and tools the project requires")

class LearningRoadmapSchema(BaseModel):
    roleTitle: str = Field(..., description="Target role career category")
    steps: List[RoadmapStepModel] = Field(default=[], description="List of curriculum steps")
    projects: List[PracticeProjectModel] = Field(default=[], description="Practice projects list")

def generate_learning_roadmap(role_title: str, missing_skills: List[str], career_memory: List[str]) -> LearningRoadmapSchema:
    """Invokes Gemma 4 E2B to draft an ordered learning roadmap with concrete resources and projects."""
    system_prompt = (
        "You are a personalized learning roadmap generator. Given a target role category, a list of missing technical skills,\n"
        "and Career Memory context representing candidate facts, compile an ordered curriculum with estimated hours and concrete practice projects.\n"
        "Always respond in valid JSON matching the schema provided."
    )
    
    prompt = (
        f"Target Role: {role_title}\n"
        f"Missing Skills: {', '.join(missing_skills) if missing_skills else 'General backend infrastructure'}\n"
        f"Candidate Career Memory Context: {career_memory}\n\n"
        f"Generate a curriculum with 3 steps to close the gap and 2 practice projects."
    )
    
    roadmap = ollama_client.generate_structured(
        prompt=prompt,
        system=system_prompt,
        schema=LearningRoadmapSchema
    )
    return roadmap
