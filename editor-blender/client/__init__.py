from inspect import isclass
from typing import AsyncGenerator, Dict, Optional, Type, TypeVar, Union

from aiohttp import ClientSession
from dataclass_wizard import JSONWizard
from gql import Client
from gql.client import AsyncClientSession, ReconnectingAsyncClientSession
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.websockets import WebsocketsTransport
from graphql import DocumentNode

from ..core.states import state
from .cache import FieldPolicy, InMemoryCache, TypePolicy, query_defs_to_field_table

GQLSession = Union[AsyncClientSession, ReconnectingAsyncClientSession]

T = TypeVar("T")


class Clients:
    def __init__(self, cache: InMemoryCache):
        self.http_client: ClientSession = ClientSession(
            "http://localhost:4000", cookies={"token": state.token}
        )

        self.client: Optional[GQLSession] = None
        self.sub_client: Optional[GQLSession] = None

        self.cache = cache

    async def subscribe(
        self, data_type: Type[T], query: DocumentNode
    ) -> AsyncGenerator[Dict[str, T], None]:
        if self.sub_client is None:
            raise Exception("GraphQL client is not initialized")

        query_dict = query.to_dict()
        selections = query_dict["definitions"][0]["selection_set"]["selections"]
        query_name = selections[0]["name"]["value"]

        async for data in self.sub_client.subscribe(query):
            # print("Sub:", data)

            # import time

            # t = time.time()
            if isclass(data_type) and issubclass(data_type, JSONWizard):
                data[query_name] = data_type.from_dict(data[query_name])
            # print(time.time() - t)

            # TODO: Support enum and list

            yield data

    async def execute(
        self, response_type: Type[T], query: DocumentNode
    ) -> Dict[str, T]:
        if self.client is None:
            raise Exception("GraphQL client is not initialized")

        query_dict = query.to_dict()
        query_def = query_defs_to_field_table(query_dict)

        definition = query_dict["definitions"][0]
        query_type = definition["operation"]

        if query_type != "query":
            return await self.client.execute(query)

        response = self.cache.read_query(response_type, query_def)

        if response is None:
            response = await self.client.execute(query)

            if isclass(response_type) and issubclass(response_type, JSONWizard):
                query_name = query_def[0]
                response[query_name] = response_type.from_dict(response[query_name])

            # TODO: Support enum and list

            self.cache.write_query(response)

        return response

    async def create_graphql_client(self):
        await self.close_graphql_client()

        token_payload = {"token": state.token}

        transport = AIOHTTPTransport(
            url="http://localhost:4000/graphql", cookies=token_payload
        )

        self.client = await Client(
            transport=transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)

        sub_transport = WebsocketsTransport(
            url="ws://localhost:4000/graphql",
            subprotocols=[WebsocketsTransport.GRAPHQLWS_SUBPROTOCOL],
            init_payload=token_payload,
        )

        self.sub_client = await Client(
            transport=sub_transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)

    async def close_graphql_client(self):
        if self.client is not None:
            await self.client.client.close_async()

        if self.sub_client is not None:
            await self.sub_client.client.close_async()

    async def update_http_client(self):
        self.http_client.cookie_jar.update_cookies({"token": state.token})

    async def close_http_client(self):
        if not self.http_client.closed:
            await self.http_client.close()


client = Clients(
    cache=InMemoryCache(
        policies={
            "ControlMap": TypePolicy(
                fields={
                    "frameIds": FieldPolicy(merge=lambda existing, incoming: incoming),
                }
            )
        }
    )
)
