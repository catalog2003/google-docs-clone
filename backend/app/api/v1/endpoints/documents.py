from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse
from app.schemas.permission import ShareDocumentRequest, RoleEnum
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=DocumentResponse)
async def create_document(
    document: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new document"""
    service = DocumentService(db)
    return await service.create_document(document, current_user.id)

@router.get("/", response_model=List[DocumentListResponse])
async def list_documents(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents for current user"""
    service = DocumentService(db)
    return await service.get_user_documents(current_user.id, skip, limit)

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific document"""
    service = DocumentService(db)
    return await service.get_document(document_id, current_user.id)

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: UUID,
    document_update: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a document"""
    service = DocumentService(db)
    return await service.update_document(document_id, document_update, current_user.id)

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document"""
    service = DocumentService(db)
    await service.delete_document(document_id, current_user.id)
    return {"message": "Document deleted successfully"}

@router.post("/{document_id}/share")
async def share_document(
    document_id: UUID,
    share_request: ShareDocumentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Share document with another user"""
    service = DocumentService(db)
    return await service.share_document(
        document_id,
        share_request.user_email,
        share_request.role,
        current_user.id
    )