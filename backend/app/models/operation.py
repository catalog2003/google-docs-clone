from sqlalchemy import Column, DateTime, ForeignKey, BigInteger, LargeBinary, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base

class Operation(Base):
    __tablename__ = "operations"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    operation = Column(LargeBinary, nullable=False)
    version = Column(BigInteger, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    __table_args__ = (
        Index('ix_operations_document_version', 'document_id', 'version'),
    )