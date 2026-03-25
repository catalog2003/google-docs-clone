from uuid import UUID
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.repositories.operation_repository import OperationRepository
from app.repositories.document_repository import DocumentRepository
from app.schemas.operation import OperationCreate, OperationResponse
from app.models.operation import Operation

class OperationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.operation_repo = OperationRepository(db)
        self.document_repo = DocumentRepository(db)
    
    def _operation_to_dict(self, operation: Operation) -> dict:
        """Convert Operation model to dictionary safely"""
        return {
            'id': operation.id,
            'document_id': operation.document_id,
            'user_id': operation.user_id,
            'version': operation.version,
            'operation': operation.operation,
            'timestamp': operation.timestamp
        }
    
    async def save_operation(self, document_id: UUID, operation_data: bytes, user_id: UUID) -> OperationResponse:
        """Save an operation"""
        # Check if user has permission to edit
        document = await self.document_repo.get_with_permission(
            document_id, 
            user_id, 
            required_role="editor"
        )
        
        if not document:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to edit this document"
            )
        
        # Get next version number
        last_version = await self.operation_repo.get_last_version(document_id) or 0
        next_version = last_version + 1
        
        # Save operation
        operation = Operation(
            document_id=document_id,
            user_id=user_id,
            version=next_version,
            operation=operation_data
        )
        
        self.db.add(operation)
        
        # Update document last_edited
        document.last_edited_by = user_id
        document.last_edited_at = func.now()
        
        await self.db.commit()
        await self.db.refresh(operation)
        
        return OperationResponse.model_validate(self._operation_to_dict(operation))
    
    async def get_operations_since(self, document_id: UUID, since_version: int = 0, user_id: UUID = None) -> List[OperationResponse]:
        """Get operations since a version"""
        # Check if user has access
        if user_id:
            document = await self.document_repo.get_with_permission(document_id, user_id)
            if not document:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have access to this document"
                )
        
        operations = await self.operation_repo.get_document_operations(document_id, since_version)
        return [OperationResponse.model_validate(self._operation_to_dict(op)) for op in operations]
    
    async def get_latest_version(self, document_id: UUID) -> int:
        """Get the latest version number"""
        version = await self.operation_repo.get_last_version(document_id)
        return version or 0