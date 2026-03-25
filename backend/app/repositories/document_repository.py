from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import load_only

from app.repositories.base import BaseRepository
from app.models.document import Document
from app.models.permission import Permission
from app.schemas.document import DocumentCreate, DocumentUpdate

class DocumentRepository(BaseRepository[Document, DocumentCreate, DocumentUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(Document, db)
    
    async def get_user_documents(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Document]:
        """Get documents where user is owner or has permission"""
        # Use OR instead of UNION to avoid JSON comparison issues
        query = select(Document).where(
            or_(
                Document.owner_id == user_id,
                Document.id.in_(
                    select(Permission.document_id).where(Permission.user_id == user_id)
                )
            )
        ).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_user_documents_simple(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Document]:
        """Get documents without loading JSON content"""
        query = select(Document).options(
            load_only(
                Document.id, 
                Document.title, 
                Document.owner_id, 
                Document.is_public, 
                Document.last_edited_at,
                Document.created_at
            )
        ).where(
            or_(
                Document.owner_id == user_id,
                Document.id.in_(
                    select(Permission.document_id).where(Permission.user_id == user_id)
                )
            )
        ).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_with_permission(
        self,
        document_id: UUID,
        user_id: UUID,
        required_role: Optional[str] = None
    ) -> Optional[Document]:
        """Get document if user has required permission"""
        query = select(Document).where(Document.id == document_id)
        
        if required_role:
            # Check if user is owner OR has required permission
            permission_subquery = select(Permission.document_id).where(
                and_(
                    Permission.user_id == user_id,
                    Permission.role == required_role
                )
            )
            
            query = query.where(
                or_(
                    Document.owner_id == user_id,
                    Document.id.in_(permission_subquery)
                )
            )
        else:
            # Check if user is owner OR has any permission
            permission_subquery = select(Permission.document_id).where(
                Permission.user_id == user_id
            )
            
            query = query.where(
                or_(
                    Document.owner_id == user_id,
                    Document.id.in_(permission_subquery)
                )
            )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()