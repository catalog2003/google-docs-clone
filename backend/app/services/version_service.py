from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime

from app.repositories.version_repository import VersionRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.permission_repository import PermissionRepository
from app.schemas.version import VersionCreate, VersionResponse
from app.schemas.permission import RoleEnum
from app.models.version import Version

class VersionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.version_repo = VersionRepository(db)
        self.document_repo = DocumentRepository(db)
        self.permission_repo = PermissionRepository(db)
    
    def _version_to_dict(self, version: Version) -> dict:
        """Convert Version model to dictionary safely"""
        return {
            'id': version.id,
            'document_id': version.document_id,
            'version_number': version.version_number,
            'content': version.content,
            'created_by': version.created_by,
            'created_at': version.created_at,
            'comment': version.comment
        }
    
    async def create_version(self, document_id: UUID, user_id: UUID, comment: Optional[str] = None) -> VersionResponse:
        """Create a new version of a document"""
        # Get document
        document = await self.document_repo.get(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user has permission
        if document.owner_id != user_id:
            permission = await self.permission_repo.get_by_user_and_document(user_id, document_id)
            if not permission or permission.role != RoleEnum.EDITOR:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to create versions"
                )
        
        # Get next version number
        latest = await self.version_repo.get_latest_version(document_id)
        next_version = (latest.version_number + 1) if latest else 1
        
        # Create version
        version = Version(
            document_id=document_id,
            version_number=next_version,
            content=document.content,
            created_by=user_id,
            comment=comment
        )
        
        self.db.add(version)
        await self.db.commit()
        await self.db.refresh(version)
        
        return VersionResponse.model_validate(self._version_to_dict(version))
    
    async def get_document_versions(self, document_id: UUID, user_id: UUID) -> List[VersionResponse]:
        """Get all versions for a document"""
        # Check if user has access to document
        document = await self.document_repo.get_with_permission(document_id, user_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied"
            )
        
        versions = await self.version_repo.get_document_versions(document_id)
        return [VersionResponse.model_validate(self._version_to_dict(v)) for v in versions]
    
    async def get_version(self, version_id: UUID, user_id: UUID) -> VersionResponse:
        """Get a specific version"""
        version = await self.version_repo.get(version_id)
        if not version:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        # Check if user has access to the document
        document = await self.document_repo.get_with_permission(version.document_id, user_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this document"
            )
        
        return VersionResponse.model_validate(self._version_to_dict(version))
    
    async def restore_version(self, document_id: UUID, version_id: UUID, user_id: UUID) -> VersionResponse:
        """Restore a document to a previous version"""
        # Get version to restore
        version = await self.version_repo.get(version_id)
        if not version or version.document_id != document_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Version not found"
            )
        
        # Get document
        document = await self.document_repo.get(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user has permission (owner or editor)
        if document.owner_id != user_id:
            permission = await self.permission_repo.get_by_user_and_document(user_id, document_id)
            if not permission or permission.role != RoleEnum.EDITOR:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to restore versions"
                )
        
        # Get the latest version number to avoid conflicts
        latest_version = await self.version_repo.get_latest_version(document_id)
        next_version = (latest_version.version_number + 1) if latest_version else 1
        
        # Update document content
        document.content = version.content
        document.last_edited_by = user_id
        document.last_edited_at = datetime.utcnow()
        
        # Create new version for restore point
        new_version = Version(
            document_id=document_id,
            version_number=next_version,
            content=version.content,
            created_by=user_id,
            comment=f"Restored from version {version.version_number}"
        )
        
        self.db.add(new_version)
        await self.db.commit()
        await self.db.refresh(new_version)
        
        return VersionResponse.model_validate(self._version_to_dict(new_version))