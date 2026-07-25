import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Any, Optional

app = FastAPI(
    title="OpportunityAI Backend API",
    description="Privacy-First Career Intelligence Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard envelope model
class ApiResponseEnvelope(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": f"Internal Server Error: {str(exc)}"
        }
    )

from app.api import auth, profile, resume, github, opportunities, ai, market, health

# Include routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(resume.router)
app.include_router(github.router)
app.include_router(opportunities.router)
app.include_router(ai.router)
app.include_router(market.router)
app.include_router(health.router)
