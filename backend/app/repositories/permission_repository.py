from typing import Optional, List
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.models.permission import Permission
from app.schemas.permission import PermissionCreate, PermissionUpdate

class PermissionRepository(BaseRepository[Permission, PermissionCreate, PermissionUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(Permission, db)
    
    async def get_by_user_and_document(self, user_id: UUID, document_id: UUID) -> Optional[Permission]:
        """Get permission by user and document"""
        query = select(Permission).where(
            and_(
                Permission.user_id == user_id,
                Permission.document_id == document_id
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_document_permissions(self, document_id: UUID) -> List[Permission]:
        """Get all permissions for a document"""
        query = select(Permission).where(Permission.document_id == document_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_user_permissions(self, user_id: UUID) -> List[Permission]:
        """Get all permissions for a user"""
        query = select(Permission).where(Permission.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalars().all()