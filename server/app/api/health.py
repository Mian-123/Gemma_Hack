from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/health", tags=["health"])

@router.get("")
def health():
    return {
        "success": True,
        "data": {
            "status": "ok",
            "version": "1.0.0"
        },
        "error": None
    }
