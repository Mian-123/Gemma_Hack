from fastapi import APIRouter
import time

router = APIRouter(prefix="/api/v1/health", tags=["health"])

@router.get("")
def health():
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "timestamp": time.time(),
            "model_configured": "gemma4:e2b"
        },
        "error": None
    }
