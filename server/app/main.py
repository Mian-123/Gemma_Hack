import time
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from app.config import settings
from app.limiter import limiter

app = FastAPI(
    title="OpportunityAI Backend API",
    description="Privacy-First Career Intelligence Platform API",
    version="1.0.0"
)

# Set limiter state in FastAPI app
app.state.limiter = limiter

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler for RateLimitExceeded
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "data": None,
            "error": f"Rate limit exceeded: {exc.detail or 'Too many requests'}"
        }
    )

# Global Exception Handler for FastAPI HTTPExceptions
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": exc.detail
        }
    )

# Global Exception Handler for Generic Unhandled Exceptions
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

# Import and register routers
from app.api import auth, profile, resume, github, opportunities, ai, market, health

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(resume.router)
app.include_router(github.router)
app.include_router(opportunities.router)
app.include_router(ai.router)
app.include_router(market.router)
app.include_router(health.router)
