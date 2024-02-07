from ....api.auth_agent import auth_agent
from ....client import client
from ....core.actions.state.app_state import set_logged_in, set_ready
from ....core.actions.state.initialize import init_blender
from ....core.states import state
from ....core.utils.ui import redraw_area
from ....storage import set_storage
from ...utils.notification import notify
from .app_state import set_requesting


async def login(username: str, password: str) -> None:
    set_requesting(True)
    login_result = await auth_agent.login(
        username=username,
        password=password,
    )
    set_requesting(False)

    if login_result.success:
        state.token = login_result.token
        state.username = username
        set_storage("token", login_result.token)
        set_storage("username", username)

        set_logged_in(True)
        await init_blender()

        notify("INFO", "Login successful.")

    else:
        notify("ERROR", f"Login failed.")


async def logout() -> None:
    set_requesting(True)
    success = await auth_agent.logout()
    set_requesting(False)

    if success:
        set_logged_in(False)
        set_ready(False)

        state.token = ""
        state.username = ""

        set_storage("token", "")
        set_storage("username", "")

        notify("INFO", "Logout successful.")

        if state.subscription_task is not None:
            state.subscription_task.cancel()
            state.subscription_task = None

        if state.init_editor_task is not None:
            state.init_editor_task.cancel()
            state.init_editor_task = None

        await client.close_graphql()
        await client.restart_http()

        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    else:
        notify("ERROR", "Logout failed.")
