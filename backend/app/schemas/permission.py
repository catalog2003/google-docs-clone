from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Optional

class RoleEnum(str, Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"

class PermissionBase(BaseModel):
    document_id: UUID
    user_id: UUID
    role: RoleEnum

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    role: RoleEnum

class PermissionResponse(PermissionBase):
    id: UUID
    granted_by: Optional[UUID] = None
    granted_at: datetime
    
    class Config:
        from_attributes = True

class ShareDocumentRequest(BaseModel):
    user_email: str
    role: RoleEnum