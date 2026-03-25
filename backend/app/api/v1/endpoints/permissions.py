from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.services.permission_service import PermissionService
from app.schemas.permission import PermissionCreate, PermissionResponse, RoleEnum
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=PermissionResponse)
async def grant_permission(
    permission: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Grant permission to a user"""
    service = PermissionService(db)
    return await service.grant_permission(permission, current_user.id)

@router.delete("/{permission_id}")
async def revoke_permission(
    permission_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke a permission"""
    service = PermissionService(db)
    await service.revoke_permission(permission_id, current_user.id)
    return {"message": "Permission revoked successfully"}

@router.get("/document/{document_id}", response_model=List[PermissionResponse])
async def get_document_permissions(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all permissions for a document"""
    service = PermissionService(db)
    return await service.get_document_permissions(document_id, current_user.id)

@router.get("/check/{document_id}")
async def check_permission(
    document_id: UUID,
    required_role: RoleEnum,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if current user has required permission"""
    service = PermissionService(db)
    has_permission = await service.check_permission(current_user.id, document_id, required_role)
    return {"has_permission": has_permission}