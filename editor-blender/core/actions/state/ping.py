from ....api.ping_agent import ping_agent
from .app_state import set_sync

fail_count = 0


async def ping_server():
    pinged = await ping_agent.ping()
    if not pinged:
        global fail_count
        fail_count += 1
        if fail_count >= 3:
            set_sync(False)
    else:
        fail_count = 0
        set_sync(True)
