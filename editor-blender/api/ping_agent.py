import asyncio
import traceback
from typing import Any

from ..client import client


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
            traceback.print_exc()
            return False


ping_agent = PingAgent()
