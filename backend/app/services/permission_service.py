from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.permission_repository import PermissionRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.permission import PermissionCreate, PermissionResponse, RoleEnum
from app.models.permission import Permission

class PermissionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.permission_repo = PermissionRepository(db)
        self.document_repo = DocumentRepository(db)
        self.user_repo = UserRepository(db)
    
    def _permission_to_dict(self, permission: Permission) -> dict:
        """Convert Permission model to dictionary safely"""
        return {
            'id': permission.id,
            'document_id': permission.document_id,
            'user_id': permission.user_id,
            'role': permission.role,
            'granted_by': permission.granted_by,
            'granted_at': permission.granted_at
        }
    
    async def grant_permission(self, permission_data: PermissionCreate, granted_by: UUID) -> PermissionResponse:
        """Grant permission to a user"""
        # Check if document exists
        document = await self.document_repo.get(permission_data.document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        # Check if user exists
        user = await self.user_repo.get(permission_data.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if grantor is owner
        if document.owner_id != granted_by:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the document owner can grant permissions"
            )
        
        # Check if permission already exists
        existing = await self.permission_repo.get_by_user_and_document(
            permission_data.user_id,
            permission_data.document_id
        )
        
        if existing:
            # Update existing
            existing.role = permission_data.role
            await self.db.commit()
            await self.db.refresh(existing)
            return PermissionResponse.model_validate(self._permission_to_dict(existing))
        else:
            # Create new
            permission = Permission(
                document_id=permission_data.document_id,
                user_id=permission_data.user_id,
                role=permission_data.role,
                granted_by=granted_by
            )
            self.db.add(permission)
            await self.db.commit()
            await self.db.refresh(permission)
            return PermissionResponse.model_validate(self._permission_to_dict(permission))
    
    async def revoke_permission(self, permission_id: UUID, user_id: UUID):
        """Revoke a permission"""
        permission = await self.permission_repo.get(permission_id)
        
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Permission not found"
            )
        
        # Check if user is document owner
        document = await self.document_repo.get(permission.document_id)
        if document.owner_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the document owner can revoke permissions"
            )
        
        await self.permission_repo.delete(permission_id)
        await self.db.commit()
    
    async def get_user_permission(self, user_id: UUID, document_id: UUID) -> Optional[PermissionResponse]:
        """Get permission for a user on a document"""
        permission = await self.permission_repo.get_by_user_and_document(user_id, document_id)
        if permission:
            return PermissionResponse.model_validate(self._permission_to_dict(permission))
        return None
    
    async def get_document_permissions(self, document_id: UUID, requesting_user_id: UUID) -> List[PermissionResponse]:
        """Get all permissions for a document"""
        # Check if user has access
        document = await self.document_repo.get(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found"
            )
        
        if document.owner_id != requesting_user_id:
            # Check if user has any permission
            user_permission = await self.permission_repo.get_by_user_and_document(requesting_user_id, document_id)
            if not user_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this document"
                )
        
        permissions = await self.permission_repo.get_document_permissions(document_id)
        return [PermissionResponse.model_validate(self._permission_to_dict(p)) for p in permissions]
    
    async def check_permission(self, user_id: UUID, document_id: UUID, required_role: RoleEnum) -> bool:
        """Check if user has required permission"""
        # Owner has all permissions
        document = await self.document_repo.get(document_id)
        if document and document.owner_id == user_id:
            return True
        
        # Check specific permission
        permission = await self.permission_repo.get_by_user_and_document(user_id, document_id)
        
        if not permission:
            return False
        
        role_hierarchy = {
            RoleEnum.OWNER: 3,
            RoleEnum.EDITOR: 2,
            RoleEnum.VIEWER: 1
        }
        
        return role_hierarchy.get(permission.role, 0) >= role_hierarchy.get(required_role, 0)