import asyncio
from typing import Any

from ..client import client
from ..core.log import logger


class PingAgent:
    async def ping(self) -> bool:
        try:
            res: dict[str, Any] = await client.get("/ping")
            revision = res.get("uuid")
            if not revision:
                return False

            return True

        except asyncio.CancelledError:
            return False

        except Exception:
            logger.exception("Failed to ping")
            return False


ping_agent = PingAgent()
