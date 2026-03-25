from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime

from app.repositories.comment_repository import CommentRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from app.models.comment import Comment

class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.comment_repo = CommentRepository(db)
        self.document_repo = DocumentRepository(db)
    
    def _comment_to_dict(self, comment: Comment) -> dict:
        """Convert Comment model to dictionary safely"""
        return {
            'id': comment.id,
            'document_id': comment.document_id,
            'user_id': comment.user_id,
            'parent_id': comment.parent_id,
            'content': comment.content,
            'selection': comment.selection,
            'resolved': comment.resolved,
            'created_at': comment.created_at,
            'updated_at': comment.updated_at
        }
    
    async def create_comment(self, comment_data: CommentCreate, user_id: UUID) -> CommentResponse:
        """Create a new comment"""
        # Check if document exists and user has access
        document = await self.document_repo.get_with_permission(comment_data.document_id, user_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied"
            )
        
        # If this is a reply, check if parent comment exists
        if comment_data.parent_id:
            parent = await self.comment_repo.get(comment_data.parent_id)
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent comment not found"
                )
        
        # Create comment
        comment = Comment(
            document_id=comment_data.document_id,
            user_id=user_id,
            content=comment_data.content,
            selection=comment_data.selection,
            parent_id=comment_data.parent_id,
            resolved=False
        )
        
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        
        return CommentResponse.model_validate(self._comment_to_dict(comment))
    
    async def get_document_comments(self, document_id: UUID, user_id: UUID) -> List[CommentResponse]:
        """Get all comments for a document"""
        # Check if user has access to document
        document = await self.document_repo.get_with_permission(document_id, user_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found or access denied"
            )
        
        comments = await self.comment_repo.get_document_comments(document_id)
        return [CommentResponse.model_validate(self._comment_to_dict(c)) for c in comments]
    
    async def update_comment(self, comment_id: UUID, comment_update: CommentUpdate, user_id: UUID) -> CommentResponse:
        """Update a comment"""
        comment = await self.comment_repo.get(comment_id)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only edit your own comments"
            )
        
        # Update fields
        if comment_update.content is not None:
            comment.content = comment_update.content
        if comment_update.resolved is not None:
            comment.resolved = comment_update.resolved
        
        comment.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(comment)
        
        return CommentResponse.model_validate(self._comment_to_dict(comment))
    
    async def delete_comment(self, comment_id: UUID, user_id: UUID):
        """Delete a comment"""
        comment = await self.comment_repo.get(comment_id)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        if comment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own comments"
            )
        
        await self.db.delete(comment)
        await self.db.commit()
    
    async def resolve_comment(self, comment_id: UUID, user_id: UUID) -> CommentResponse:
        """Resolve a comment"""
        comment = await self.comment_repo.get(comment_id)
        
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Comment not found"
            )
        
        # Check if user has permission (document owner or comment author)
        document = await self.document_repo.get(comment.document_id)
        if document.owner_id != user_id and comment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to resolve this comment"
            )
        
        comment.resolved = True
        comment.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(comment)
        
        return CommentResponse.model_validate(self._comment_to_dict(comment))