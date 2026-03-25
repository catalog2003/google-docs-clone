from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any

class CommentBase(BaseModel):
    content: str
    selection: Optional[Dict[str, Any]] = None

class CommentCreate(CommentBase):
    document_id: UUID
    parent_id: Optional[UUID] = None

class CommentUpdate(BaseModel):
    content: Optional[str] = None
    resolved: Optional[bool] = None

class CommentResponse(CommentBase):
    id: UUID
    document_id: UUID
    user_id: UUID
    parent_id: Optional[UUID] = None
    resolved: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    replies: Optional[List['CommentResponse']] = None
    
    class Config:
        from_attributes = True

CommentResponse.model_rebuild()