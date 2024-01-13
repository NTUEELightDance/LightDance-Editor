from ....api.auth_agent import authAgent
from ....client import client
from ....client.subscription import subscribe
from ....core.asyncio import AsyncTask
from ....core.states import state
from ....preferences import set_preference


async def login(username: str, password: str):
    login_result = await authAgent.login(
        username=username,
        password=password,
    )

    state.is_logged_in = login_result.success
    state.token = login_result.token

    set_preference("token", login_result.token)

    if login_result.success:
        await client.restart_http()
        await client.restart_graphql()

        AsyncTask(subscribe).then(lambda _: print("Subscription closed.")).catch(
            lambda e: print(e)
        ).exec()

        # TODO: Initialize editor
