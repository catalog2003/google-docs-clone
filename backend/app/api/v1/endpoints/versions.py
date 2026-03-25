from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.services.version_service import VersionService
from app.schemas.version import VersionResponse, VersionRestoreRequest
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/document/{document_id}", response_model=VersionResponse)
async def create_version(
    document_id: UUID,
    comment: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new version of a document"""
    service = VersionService(db)
    return await service.create_version(document_id, current_user.id, comment)

@router.get("/document/{document_id}", response_model=List[VersionResponse])
async def get_document_versions(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all versions of a document"""
    service = VersionService(db)
    return await service.get_document_versions(document_id, current_user.id)

@router.get("/{version_id}", response_model=VersionResponse)
async def get_version(
    version_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific version"""
    service = VersionService(db)
    return await service.get_version(version_id, current_user.id)

@router.post("/{version_id}/restore", response_model=VersionResponse)
async def restore_version(
    version_id: UUID,
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Restore a document to a previous version"""
    service = VersionService(db)
    return await service.restore_version(document_id, version_id, current_user.id)