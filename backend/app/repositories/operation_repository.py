from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.models.operation import Operation
from app.schemas.operation import OperationCreate, OperationUpdate

class OperationRepository(BaseRepository[Operation, OperationCreate, OperationUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(Operation, db)
    
    async def get_document_operations(self, document_id: UUID, since_version: int = 0) -> List[Operation]:
        """Get operations for a document since a version"""
        query = select(Operation).where(
            Operation.document_id == document_id,
            Operation.version > since_version
        ).order_by(Operation.version)
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_last_version(self, document_id: UUID) -> Optional[int]:
        """Get the last version number for a document"""
        query = select(Operation.version).where(
            Operation.document_id == document_id
        ).order_by(desc(Operation.version)).limit(1)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()