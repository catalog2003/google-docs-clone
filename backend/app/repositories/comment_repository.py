from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate

class CommentRepository(BaseRepository[Comment, CommentCreate, CommentUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(Comment, db)
    
    async def get_document_comments(self, document_id: UUID) -> List[Comment]:
        """Get all comments for a document"""
        query = select(Comment).where(
            Comment.document_id == document_id
        ).order_by(Comment.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_thread_comments(self, parent_id: UUID) -> List[Comment]:
        """Get all replies in a thread"""
        query = select(Comment).where(
            Comment.parent_id == parent_id
        ).order_by(Comment.created_at)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def resolve_comment(self, comment_id: UUID) -> Optional[Comment]:
        """Mark a comment as resolved"""
        comment = await self.get(comment_id)
        if comment:
            comment.resolved = True
            await self.db.flush()
            await self.db.refresh(comment)
        return comment