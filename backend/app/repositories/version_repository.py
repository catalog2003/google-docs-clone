from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base import BaseRepository
from app.models.version import Version
from app.schemas.version import VersionCreate, VersionUpdate

class VersionRepository(BaseRepository[Version, VersionCreate, VersionUpdate]):
    def __init__(self, db: AsyncSession):
        super().__init__(Version, db)
    
    async def get_document_versions(self, document_id: UUID) -> List[Version]:
        """Get all versions for a document"""
        query = select(Version).where(
            Version.document_id == document_id
        ).order_by(desc(Version.version_number))
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_latest_version(self, document_id: UUID) -> Optional[Version]:
        """Get the latest version for a document"""
        query = select(Version).where(
            Version.document_id == document_id
        ).order_by(desc(Version.version_number)).limit(1)
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_version_by_number(self, document_id: UUID, version_number: int) -> Optional[Version]:
        """Get a specific version by number"""
        query = select(Version).where(
            and_(
                Version.document_id == document_id,
                Version.version_number == version_number
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()