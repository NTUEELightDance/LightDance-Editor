from ....api.auth_agent import authAgent
from ....client import client
from ....client.subscription import subscribe
from ....core.asyncio import AsyncTask
from ....core.states import state

# # NOTE: Test
# async def query_test():
#     query = gql(
#         """
#         query controlMap {
#             ControlMap {
#                 frameIds
#             }
#         }
#         """
#     )
#
#     if client.client is not None:
#         print('Querying...')
#         result = await client.execute(query)
#         print(result)


async def login(username: str, password: str):
    login_result = await authAgent.login(
        username=username,
        password=password,
    )

    state.is_logged_in = login_result.success
    state.token = login_result.token

    if login_result.success:
        await client.update_http_client()
        await client.create_graphql_client()

        AsyncTask(subscribe).then(lambda _: print("Subscription closed.")).catch(
            lambda e: print(e)
        ).exec()

        # NOTE: Test
        # await query_test()
