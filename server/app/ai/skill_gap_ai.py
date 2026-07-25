from pydantic import BaseModel, Field
from typing import List
from app.ai.ollama_client import ollama_client
from app.ai.embeddings import embed_text, cosine_similarity

class SkillGapItemModel(BaseModel):
    skill: str = Field(..., description="Name of the technology or skill")
    category: str = Field(..., description="Classification: matched, weak, missing, or extra")
    details: str = Field(..., description="Details regarding evidence or recommendation")

class SkillGapReportSchema(BaseModel):
    overallMatchPercentage: int = Field(..., ge=0, le=100, description="Overall compatibility score (0 to 100)")
    gapSummary: str = Field(..., description="A concise explanation summarizing gaps and alignments")
    skills: List[SkillGapItemModel] = Field(default=[], description="Classified list of individual skills")
    roadmapSeedSkills: List[str] = Field(default=[], description="List of missing or weak skills to guide the learning roadmap")

def analyze_skill_gap(profile_data: dict, jd_text: str) -> SkillGapReportSchema:
    """
    Computes semantic skill alignments using all-MiniLM-L6-v2 embeddings and 
    invokes Gemma 4 E2B to compile the match summary.
    """
    # 1. Gather all candidate skills from profile
    candidate_skills = []
    if "skills" in profile_data:
        candidate_skills.extend(profile_data["skills"])
    if "preferred_language" in profile_data and profile_data["preferred_language"]:
        candidate_skills.append(profile_data["preferred_language"])
        
    candidate_skills = list(set([s.strip() for s in candidate_skills if s.strip()]))
    
    # 2. Extract key skills from job description using a fast heuristic or let Gemma extract them.
    # To perform semantic matching, we first ask Gemma to identify key required skills from the JD:
    extraction_system = "You are a developer hiring requirements extraction system. Extract a flat list of technical skills and tools required in the job description."
    extraction_prompt = f"Extract a JSON list of required technical tools/languages from this Job Description:\n{jd_text}\n\nReturn ONLY a JSON list of strings under key 'required_skills'."
    
    required_skills = []
    try:
        class RequiredSkillsList(BaseModel):
            required_skills: List[str]
        res = ollama_client.generate_structured(extraction_prompt, system=extraction_system, schema=RequiredSkillsList)
        required_skills = res.required_skills
    except Exception as e:
        print(f"Warning: Failed to extract required skills via Gemma: {e}. Falling back to default list.")
        required_skills = ["Python", "Docker", "FastAPI", "SQL"]

    # 3. Perform semantic embedding comparisons
    skills_analysis = []
    matched_count = 0
    roadmap_seeds = []
    
    # Embed candidate skills
    candidate_embeddings = [(skill, embed_text(skill)) for skill in candidate_skills]
    
    # Map required skills
    for req_skill in required_skills:
        req_emb = embed_text(req_skill)
        best_sim = 0.0
        best_match = ""
        
        for cand_skill, cand_emb in candidate_embeddings:
            sim = cosine_similarity(req_emb, cand_emb)
            if sim > best_sim:
                best_sim = sim
                best_match = cand_skill
                
        if best_sim >= 0.75:
            # Semantic match
            skills_analysis.append(SkillGapItemModel(
                skill=req_skill,
                category="matched",
                details=f"Semantically matched to '{best_match}' on your profile (similarity: {round(best_sim, 2)})"
            ))
            matched_count += 1
        elif best_sim >= 0.50:
            # Weak match
            skills_analysis.append(SkillGapItemModel(
                skill=req_skill,
                category="weak",
                details=f"Partially matched to '{best_match}'. Brush up on advanced concepts."
            ))
            matched_count += 0.5
            roadmap_seeds.append(req_skill)
        else:
            # Missing skill
            skills_analysis.append(SkillGapItemModel(
                skill=req_skill,
                category="missing",
                details="Missing from your profile. Recommended to add to your study roadmap."
            ))
            roadmap_seeds.append(req_skill)

    # Map extra candidate skills
    required_embeddings = [embed_text(req) for req in required_skills]
    for cand_skill, cand_emb in candidate_embeddings:
        is_extra = True
        for req_emb in required_embeddings:
            sim = cosine_similarity(cand_emb, req_emb)
            if sim >= 0.50:
                is_extra = False
                break
        if is_extra:
            skills_analysis.append(SkillGapItemModel(
                skill=cand_skill,
                category="extra",
                details="An additional technical competency not explicitly requested in this job description."
            ))

    # Calculate overall match percentage
    overall_match = 100
    if required_skills:
        overall_match = int((matched_count / len(required_skills)) * 100)
    overall_match = min(max(overall_match, 0), 100)

    # 4. Generate human narrative via Gemma 4 E2B
    summary_system = (
        "You are an experienced technical evaluator. Write a concise, professional, human-readable match evaluation summary "
        "describing how the candidate's skills align with the target job description and listing what they should learn."
    )
    
    summary_prompt = (
        f"Match percentage: {overall_match}%\n"
        f"Classified Skills:\n"
        f"Matched: {[s.skill for s in skills_analysis if s.category == 'matched']}\n"
        f"Weak: {[s.skill for s in skills_analysis if s.category == 'weak']}\n"
        f"Missing: {[s.skill for s in skills_analysis if s.category == 'missing']}\n"
        f"Extra: {[s.skill for s in skills_analysis if s.category == 'extra']}\n\n"
        f"Write a 2-3 sentence professional explanation summary under key 'gapSummary'."
    )
    
    class SummaryResponse(BaseModel):
        gapSummary: str
        
    try:
        summary_res = ollama_client.generate_structured(summary_prompt, system=summary_system, schema=SummaryResponse)
        gap_summary = summary_res.gapSummary
    except Exception as e:
        print(f"Warning: Gemma summary failed: {e}. Falling back to default description.")
        gap_summary = f"You match {overall_match}% of the required skills. Focus on learning {[s.skill for s in skills_analysis if s.category == 'missing']} to close the gap."

    return SkillGapReportSchema(
        overallMatchPercentage=overall_match,
        gapSummary=gap_summary,
        skills=skills_analysis,
        roadmapSeedSkills=roadmap_seeds
    )
