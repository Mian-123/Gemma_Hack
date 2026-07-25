# Crawled opportunity data normalizer to fit the Opportunity DB model
def normalize_opportunity(raw_data: dict) -> dict:
    # Normalize skills format (e.g. "Python, FastAPI" -> ["Python", "FastAPI"])
    skills_raw = raw_data.get("skills", [])
    if isinstance(skills_raw, str):
        skills_required = [s.strip() for s in skills_raw.split(",") if s.strip()]
    elif isinstance(skills_raw, list):
        skills_required = [str(s).strip() for s in skills_raw if str(s).strip()]
    else:
        skills_required = []

    # Map other fields with sensible defaults
    return {
        "title": str(raw_data.get("title", "Untitled Opportunity")),
        "company": str(raw_data.get("company", "Unknown")),
        "description": str(raw_data.get("description", "")),
        "opportunity_type": str(raw_data.get("opportunity_type", "job")),
        "url": str(raw_data.get("url", "")),
        "location": str(raw_data.get("location", "Remote")),
        "skills_required": skills_required
    }
