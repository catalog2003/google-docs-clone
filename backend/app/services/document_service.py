from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime

from app.repositories.document_repository import DocumentRepository
from app.repositories.permission_repository import PermissionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentListResponse
from app.schemas.permission import RoleEnum
from app.models.document import Document
from app.models.permission import Permission

class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.document_repo = DocumentRepository(db)
        self.permission_repo = PermissionRepository(db)
        self.user_repo = UserRepository(db)
    
    def _document_to_dict(self, document: Document) -> dict:
        """Convert Document model to dictionary safely"""
        return {
            'id': document.id,
            'title': document.title,
            'content': document.content,
            'owner_id': document.owner_id,
            'is_public': document.is_public,
            'last_edited_at': document.last_edited_at,
            'last_edited_by': document.last_edited_by,
            'created_at': document.created_at,
            'updated_at': document.updated_at
        }
    
    def _document_list_to_dict(self, document: Document) -> dict:
        """Convert Document model to simplified dictionary for list view"""
        return {
            'id': document.id,
            'title': document.title,
            'owner_id': document.owner_id,
            'is_public': document.is_public,
            'last_edited_at': document.last_edited_at,
            'created_at': document.created_at
        }
    
    async def create_document(
        self,
        document_data: DocumentCreate,
        user_id: UUID
    ) -> DocumentResponse:
        """Create a new document"""
        document = Document(
            title=document_data.title,
            content=document_data.content or {"ops": [{"insert": "\n"}]},
            owner_id=user_id,
            is_public=False,
            last_edited_by=user_id
        )
        
        self.db.add(document)
        await self.db.flush()
        
        # Create owner permission
        permission = Permission(
            document_id=document.id,
            user_id=user_id,
            role=RoleEnum.OWNER,
            granted_by=user_id
        )
        self.db.add(permission)
        
        await self.db.commit()
        await self.db.refresh(document)
        
        return DocumentResponse.model_validate(self._document_to_dict(document))
    
    async def get_user_documents(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 50
    ) -> List[DocumentListResponse]:
        """Get all documents for a user"""
        documents = await self.document_repo.get_user_documents_simple(user_id, skip, limit)
        return [DocumentListResponse.model_validate(self._document_list_to_dict(doc)) for doc in documents]
    
    async def get_document(
        self,
        document_id: UUID,
        user_id: UUID
    ) -> DocumentResponse:
        """Get a document by ID with permission check"""
        document = await self.document_repo.get_with_permission(document_id, user_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied"
            )
        
        return DocumentResponse.model_validate(self._document_to_dict(document))
    
    async def update_document(
        self,
        document_id: UUID,
        document_update: DocumentUpdate,
        user_id: UUID
    ) -> DocumentResponse:
        """Update a document with permission check"""
        document = await self.document_repo.get_with_permission(
            document_id,
            user_id,
            required_role="editor"
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or insufficient permissions"
            )
        
        # Update fields
        if document_update.title is not None:
            document.title = document_update.title
        if document_update.content is not None:
            document.content = document_update.content
        if document_update.is_public is not None:
            document.is_public = document_update.is_public
        
        document.last_edited_by = user_id
        document.last_edited_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(document)
        
        return DocumentResponse.model_validate(self._document_to_dict(document))
    
    async def delete_document(
        self,
        document_id: UUID,
        user_id: UUID
    ) -> None:
        """Delete a document (owner only)"""
        document = await self.document_repo.get(document_id)
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if document.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the owner of this document"
            )
        
        await self.db.delete(document)
        await self.db.commit()
    
    async def share_document(
        self,
        document_id: UUID,
        user_email: str,
        role: RoleEnum,
        owner_id: UUID
    ) -> dict:
        """Share document with another user"""
        # Get user by email
        user = await self.user_repo.get_by_email(user_email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if current user is owner
        document = await self.document_repo.get(document_id)
        if not document or document.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the owner can share this document"
            )
        
        # Check if permission already exists
        existing = await self.permission_repo.get_by_user_and_document(
            user.id, document_id
        )
        
        if existing:
            # Update existing permission
            existing.role = role
            await self.db.flush()
        else:
            # Create new permission
            permission = Permission(
                document_id=document_id,
                user_id=user.id,
                role=role,
                granted_by=owner_id
            )
            self.db.add(permission)
        
        await self.db.commit()
        
        return {"message": f"Document shared with {user_email} as {role.value}"}