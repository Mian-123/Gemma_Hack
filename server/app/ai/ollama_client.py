import os
import time
import json
import httpx
from typing import Type
from pydantic import BaseModel
from app.config import settings
from app.database.session import SessionLocal
from app.database.models import AICallLog

class AIGenerationError(Exception):
    """Exception raised when Gemma model response generation or validation fails."""
    pass

class OllamaClient:
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self.model = model or settings.OLLAMA_MODEL

    def log_ai_call(self, function_name: str, input_summary: str, duration_ms: int, output_schema: str = ""):
        """Log the details of the AI call to the database for transparency."""
        db = SessionLocal()
        try:
            log_entry = AICallLog(
                function_name=function_name,
                input_summary=input_summary[:1000],  # Truncate summary if too large
                duration_ms=duration_ms,
                output_schema=output_schema[:255]
            )
            db.add(log_entry)
            db.commit()
        except Exception as db_err:
            print(f"Warning: Failed to write AI log to database: {db_err}")
        finally:
            db.close()

    def generate(self, prompt: str, system: str = None, json_mode: bool = True, timeout: float = 180.0) -> str:
        """Execute raw prompt generation via Ollama's local REST API."""
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        if json_mode:
            payload["format"] = "json"
        if system:
            payload["system"] = system

        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("response", "").strip()
        except Exception as e:
            print(f"Local Ollama connection failed: {e}")
            raise AIGenerationError(f"Ollama generation failed: {e}")

    def _clean_json(self, raw_text: str) -> str:
        """Strip markdown code fence blocks if returned by the model."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    def generate_structured(self, prompt: str, system: str, schema: Type[BaseModel], timeout: float = 180.0) -> BaseModel:
        """Execute prompt generation and validate output JSON against the Pydantic schema with one retry correction."""
        start_time = time.time()
        schema_json = json.dumps(schema.model_json_schema())
        
        # 1. Prepare structured instruction
        structured_prompt = (
            f"{prompt}\n\n"
            f"You MUST return ONLY valid JSON matching this JSON Schema:\n{schema_json}\n"
            f"Do not include any preambles, explanations, or code formatting fences. Return only the JSON object."
        )

        raw_response = ""
        duration_ms = 0
        try:
            raw_response = self.generate(structured_prompt, system=system, json_mode=True, timeout=timeout)
            cleaned_json = self._clean_json(raw_response)
            validated_obj = schema.model_validate_json(cleaned_json)
            
            # Log successful call
            duration_ms = int((time.time() - start_time) * 1000)
            self.log_ai_call(schema.__name__, f"Prompt size: {len(prompt)}", duration_ms, schema.__name__)
            return validated_obj
        except Exception as err:
            print(f"Warning: First AI structure attempt failed. Error: {err}. Retrying with correction...")
            
            # 2. Correction retry
            correction_prompt = (
                f"Your last response was invalid JSON or did not match the required schema. Error details: {str(err)}\n"
                f"Previous output was:\n{raw_response}\n\n"
                f"Please fix it and return ONLY valid JSON matching this schema:\n{schema_json}"
            )
            
            try:
                raw_response = self.generate(correction_prompt, system=system, json_mode=True, timeout=timeout)
                cleaned_json = self._clean_json(raw_response)
                validated_obj = schema.model_validate_json(cleaned_json)
                
                # Log successful retry call
                duration_ms = int((time.time() - start_time) * 1000)
                self.log_ai_call(schema.__name__, f"Retry prompt size: {len(correction_prompt)}", duration_ms, schema.__name__)
                return validated_obj
            except Exception as retry_err:
                duration_ms = int((time.time() - start_time) * 1000)
                self.log_ai_call(schema.__name__, f"Failed: {str(retry_err)}", duration_ms, "FAIL")
                raise AIGenerationError(
                    f"Gemma failed to generate structured data after correction attempt: {retry_err}. Response was: {raw_response}"
                )

ollama_client = OllamaClient()
