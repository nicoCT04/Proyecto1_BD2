from typing import List, Dict, Any
from fastapi import WebSocket
import json
from datetime import datetime

import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None

    async def connect(self, websocket: WebSocket):
        if self.loop is None:
            self.loop = asyncio.get_running_loop()
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # We need to serialize to JSON to handle things like ObjectId if they slip through,
        # but the CommandListener should ideally do safe stringification.
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting to a websocket: {e}")

manager = ConnectionManager()
