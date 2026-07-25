"""
Input sanitization utilities for text before sending to Gemma via Ollama.
Strips prompt injection attempts, excessively long inputs, and control characters.
NOTE: Ollama (Gemma 4 E2B) runs LOCALLY. No resume or JD text is ever sent
to an external LLM API. Supabase is used exclusively for structured data
persistence (users, reports, resumes) and file storage — not for inference.
"""

import re

# Maximum allowed character lengths for user-supplied text
MAX_RESUME_TEXT_LEN = 12_000
MAX_JD_TEXT_LEN = 8_000
MAX_GENERIC_TEXT_LEN = 4_000

# Patterns that attempt to break out of the model's system prompt context
_INJECTION_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"ignore\s+all\s+prior",
    r"you\s+are\s+now",
    r"disregard\s+your\s+instructions",
    r"act\s+as\s+(if|though)",
    r"jailbreak",
    r"DAN\s+mode",
]
_INJECTION_RE = re.compile("|".join(_INJECTION_PATTERNS), re.IGNORECASE)


def sanitize_text(text: str, max_length: int = MAX_GENERIC_TEXT_LEN) -> str:
    """
    Sanitize user-supplied text before it is included in a Gemma prompt.
    Steps:
      1. Strip leading/trailing whitespace.
      2. Remove null bytes and non-printable control characters.
      3. Truncate to max_length characters.
      4. Strip known prompt-injection patterns.
    """
    if not isinstance(text, str):
        return ""

    # 1. Strip whitespace
    cleaned = text.strip()

    # 2. Remove null bytes and control chars (keep newlines/tabs for readability)
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", cleaned)

    # 3. Truncate
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length] + "\n[... truncated for safety ...]"

    # 4. Neutralise injection attempts by replacing them with a safe placeholder
    cleaned = _INJECTION_RE.sub("[REDACTED]", cleaned)

    return cleaned


def sanitize_resume_text(text: str) -> str:
    return sanitize_text(text, MAX_RESUME_TEXT_LEN)


def sanitize_jd_text(text: str) -> str:
    return sanitize_text(text, MAX_JD_TEXT_LEN)
