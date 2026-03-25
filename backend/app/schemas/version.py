from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

class VersionBase(BaseModel):
    document_id: UUID
    version_number: int
    content: Dict[str, Any]

class VersionCreate(VersionBase):
    created_by: UUID
    comment: Optional[str] = None

class VersionUpdate(BaseModel):
    comment: Optional[str] = None

class VersionResponse(VersionBase):
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    comment: Optional[str] = None
    
    class Config:
        from_attributes = True

class VersionRestoreRequest(BaseModel):
    version_id: UUID