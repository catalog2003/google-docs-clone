from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,          # FIX: echo=True floods logs in production
    future=True,
    pool_pre_ping=True,  # Detect stale connections
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    """Dependency that provides a database session with proper error handling."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()   # Auto-commit on clean exit
        except Exception:
            await session.rollback() # Rollback on error
            raise
        finally:
            await session.close()