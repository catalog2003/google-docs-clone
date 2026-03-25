from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class OperationBase(BaseModel):
    document_id: UUID
    user_id: UUID
    version: int

class OperationCreate(OperationBase):
    operation: bytes

class OperationUpdate(BaseModel):
    pass

class OperationResponse(OperationBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True