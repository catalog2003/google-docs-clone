from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class DocumentBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[Dict[str, Any]] = {"ops": [{"insert": "\n"}]}

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: UUID
    owner_id: UUID
    is_public: bool
    last_edited_at: datetime
    last_edited_by: Optional[UUID] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    id: UUID
    title: str
    owner_id: UUID
    is_public: bool
    last_edited_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True