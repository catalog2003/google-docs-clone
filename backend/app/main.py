from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.v1.endpoints import auth, documents, permissions, versions, comments
from app.api.v1.websocket import document_ws
from app.api.middleware.auth_middleware import AuthMiddleware
from app.api.middleware.logging_middleware import LoggingMiddleware
from app.core.config import settings
from app.core.database import engine
from app.models import Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Google Docs Clone API",
    version="1.0.0",
    description="Real-time collaborative document editor",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)
app.add_middleware(AuthMiddleware)
app.add_middleware(LoggingMiddleware)
# Set up CORS - Allow all origins
# Set up CORS - Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add custom middleware


# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(documents.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(permissions.router, prefix=f"{settings.API_V1_STR}/permissions", tags=["permissions"])
app.include_router(versions.router, prefix=f"{settings.API_V1_STR}/versions", tags=["versions"])
app.include_router(comments.router, prefix=f"{settings.API_V1_STR}/comments", tags=["comments"])
app.include_router(document_ws.router, tags=["websocket"])

@app.on_event("startup")
async def startup():
    logger.info("Starting up...")
    # Create database tables (in production, use Alembic migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down...")
    await engine.dispose()

@app.get("/")
async def root():
    return {
        "message": "Welcome to Google Docs Clone API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}