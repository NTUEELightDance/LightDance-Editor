from ....api.auth_agent import auth_agent
from ....client import client
from ....core.actions.state.app_state import set_logged_in, set_ready
from ....core.actions.state.initialize import init_blender
from ....core.log import logger
from ....core.states import state
from ....core.utils.ui import redraw_area
from ....handlers import unmount_handlers
from ....storage import set_storage
from ...utils.notification import notify
from .app_state import send_request, set_sync


async def login(username: str, password: str) -> None:
    with send_request():
        logger.info(f"Current state.requesting: {state.requesting}")
        login_result = await auth_agent.login(
            username=username,
            password=password,
        )

    if login_result.success:
        state.token = login_result.token
        state.username = username
        set_storage("token", login_result.token)
        set_storage("username", username)

        set_logged_in(True)
        await init_blender()

        notify("INFO", "Login successful.")

    else:
        notify("ERROR", "Login failed.")


async def logout() -> None:
    with send_request():
        success = await auth_agent.logout()

    if success:
        set_sync(False)
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

        if state.command_task is not None:
            state.command_task.cancel()
            state.command_task = None

        await client.close_graphql()
        await client.restart_http()
        await client.close_command()

        unmount_handlers()
        logger.info("Handlers unmounted")

        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    else:
        notify("ERROR", "Logout failed.")
