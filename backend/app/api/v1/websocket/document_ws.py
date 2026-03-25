from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
from jose import jwt, JWTError
import logging

from app.core.config import settings
from app.services.websocket_manager import manager
from app.core.database import AsyncSessionLocal

router = APIRouter()
logger = logging.getLogger(__name__)


@router.websocket("/ws/{document_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    document_id: str,
    token: Optional[str] = Query(None),
):
    """WebSocket endpoint — Yjs binary protocol only."""

    await websocket.accept()
    logger.info(f"WebSocket accepted for document {document_id}")

    if not token:
        await websocket.close(code=1008, reason="Missing authentication token")
        return

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
    except JWTError as e:
        logger.warning(f"WebSocket JWT error: {e}")
        await websocket.close(code=1008, reason="Invalid token")
        return

    if not user_id:
        await websocket.close(code=1008, reason="Invalid token payload")
        return

    # FIX: manually managed DB session (Depends doesn't work well with WebSocket)
    async with AsyncSessionLocal() as db:
        try:
            from app.services.auth_service import AuthService
            from app.repositories.document_repository import DocumentRepository

            auth_service = AuthService(db)
            user = await auth_service.get_current_user(token)
            if not user:
                await websocket.close(code=1008, reason="User not found")
                return

            doc_repo = DocumentRepository(db)
            document = await doc_repo.get_with_permission(document_id, user.id)
            if not document:
                await websocket.close(code=1008, reason="Access denied")
                return

            logger.info(f"User {user.username} joined document {document_id}")
        except Exception as e:
            logger.error(f"WebSocket setup error: {e}", exc_info=True)
            try:
                await websocket.close(code=1011, reason="Internal server error")
            except Exception:
                pass
            return

    # Connect to room (outside DB session)
    await manager.connect(
        document_id,
        str(user.id),
        {"username": user.username, "email": user.email, "user_id": str(user.id)},
        websocket,
    )

    # Message loop
    try:
        while True:
            message = await websocket.receive()

            if message["type"] == "websocket.disconnect":
                break

            if message.get("bytes"):
                await manager.broadcast_bytes(
                    message["bytes"],
                    document_id,
                    exclude_websocket=websocket,
                )

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket message loop error: {e}", exc_info=True)
    finally:
        await manager.disconnect(document_id, str(user.id))
        logger.info(f"User {user.username} disconnected")