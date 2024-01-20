from ....api.auth_agent import auth_agent
from ....client import client
from ....client.subscription import subscribe
from ....core.actions.state.initialize import init_editor
from ....core.asyncio import AsyncTask
from ....core.states import state
from ....core.utils.operator import execute_operator
from ....core.utils.ui import redraw_area
from ....handlers import mount
from ....storage import set_storage


async def login(username: str, password: str) -> bool:
    login_result = await auth_agent.login(
        username=username,
        password=password,
    )

    if login_result.success:
        state.token = login_result.token
        set_storage("token", login_result.token)

        state.is_logged_in = True
        redraw_area("VIEW_3D")

        await client.restart_http()
        await client.restart_graphql()

        if state.subscription_task is not None:
            state.subscription_task.cancel()
        state.subscription_task = AsyncTask(subscribe).exec()

        # Initialize editor
        if state.init_editor_task is not None:
            state.init_editor_task.cancel()
        state.init_editor_task = AsyncTask(init_editor).exec()

        # Mount handlers
        mount()

        # Start notification system
        execute_operator("lightdance.notification")

    return login_result.success


async def logout() -> bool:
    success = await auth_agent.logout()

    if success:
        state.is_logged_in = False
        state.ready = False
        state.token = ""

        set_storage("token", "")

        if state.subscription_task is not None:
            state.subscription_task.cancel()
            state.subscription_task = None

        if state.init_editor_task is not None:
            state.init_editor_task.cancel()
            state.init_editor_task = None

        await client.close_graphql()
        await client.restart_http()

        redraw_area("VIEW_3D")

    return success
