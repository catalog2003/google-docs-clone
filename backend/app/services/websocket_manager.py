from typing import Dict, Set, Optional
from fastapi import WebSocket
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.room_users: Dict[str, Dict[str, dict]] = {}
        self.typing_users: Dict[str, Set[str]] = {}

    async def connect(
        self,
        document_id: str,
        user_id: str,
        user_data: dict,
        websocket: WebSocket,
    ) -> None:
        if document_id not in self.active_connections:
            self.active_connections[document_id] = {}
            self.room_users[document_id] = {}
            self.typing_users[document_id] = set()

        # FIX: close any stale connection for the same user
        if user_id in self.active_connections[document_id]:
            old_ws = self.active_connections[document_id][user_id]
            try:
                await old_ws.close(code=1008, reason="Replaced by new connection")
            except Exception:
                pass

        self.active_connections[document_id][user_id] = websocket
        self.room_users[document_id][user_id] = {
            "user_id": user_id,
            "username": user_data.get("username", "Anonymous"),
            "color": self._assign_color(user_id),
            "cursor": None,
            "connected_at": datetime.utcnow().isoformat(),
        }
        logger.info(
            f"User {user_id} connected to document {document_id}. "
            f"Total: {len(self.active_connections[document_id])}"
        )

    def _assign_color(self, user_id: str) -> str:
        colors = [
            "#f44336", "#2196f3", "#4caf50", "#ff9800",
            "#9c27b0", "#00bcd4", "#e91e63", "#3f51b5",
            "#009688", "#ff5722",
        ]
        return colors[hash(user_id) % len(colors)]

    async def broadcast_bytes(
        self,
        data: bytes,
        document_id: str,
        exclude_websocket: Optional[WebSocket] = None,
    ) -> None:
        if document_id not in self.active_connections:
            return

        disconnected: list[str] = []
        # FIX: snapshot to avoid dict mutation during iteration
        for user_id, connection in list(self.active_connections[document_id].items()):
            if connection is exclude_websocket:
                continue
            try:
                await connection.send_bytes(data)
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id}: {e}")
                disconnected.append(user_id)

        for user_id in disconnected:
            await self.disconnect(document_id, user_id)

    async def disconnect(self, document_id: str, user_id: str) -> None:
        if document_id not in self.active_connections:
            return

        self.active_connections[document_id].pop(user_id, None)
        self.room_users.get(document_id, {}).pop(user_id, None)
        self.typing_users.get(document_id, set()).discard(user_id)

        # Clean up empty room
        if not self.active_connections.get(document_id):
            self.active_connections.pop(document_id, None)
            self.room_users.pop(document_id, None)
            self.typing_users.pop(document_id, None)
            logger.info(f"Room {document_id} cleaned up (empty)")

        logger.info(f"User {user_id} disconnected from document {document_id}")


manager = ConnectionManager()