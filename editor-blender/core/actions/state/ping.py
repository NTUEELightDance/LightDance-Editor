from ....api.ping_agent import ping_agent
from .app_state import set_sync


async def ping_server():
    pinged = await ping_agent.ping()
    set_sync(pinged)
