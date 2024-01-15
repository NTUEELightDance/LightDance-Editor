import asyncio
from inspect import isclass
from typing import Any, AsyncGenerator, Dict, List, Optional, Type, TypeVar, Union

from aiohttp import ClientSession
from dataclass_wizard import JSONWizard
from dataclass_wizard.constants import os
from gql import Client
from gql.client import AsyncClientSession, ReconnectingAsyncClientSession
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.websockets import WebsocketsTransport
from graphql import DocumentNode

from ..core.actions.state.color_map import set_color_map
from ..core.actions.state.control_map import set_control_map
from ..core.actions.state.pos_map import set_pos_map
from ..core.states import state
from ..core.utils.convert import (
    color_map_query_to_state,
    control_map_query_to_state,
    pos_map_query_to_state,
)
from ..graphqls.queries import (
    QueryColorMapPayload,
    QueryControlMapPayload,
    QueryPosMapPayload,
)
from .cache import FieldPolicy, InMemoryCache, TypePolicy, query_defs_to_field_table

GQLSession = Union[AsyncClientSession, ReconnectingAsyncClientSession]

T = TypeVar("T")


def serialize(data: Any) -> Dict[str, Any]:
    # TODO: Support enum
    if isinstance(data, JSONWizard):
        return data.to_dict()
    elif isinstance(data, list):
        return list(map(serialize, data))  # type: ignore
    elif isinstance(data, dict):
        return {key: serialize(value) for key, value in data.items()}  # type: ignore
    else:
        return data


def deserialize(response_type: Type[T], data: Any) -> Any:
    # TODO: Support enum
    if isclass(response_type) and issubclass(response_type, JSONWizard):
        return response_type.from_dict(data)
    elif isinstance(data, list):
        return list(map(lambda item: deserialize(response_type.__args__[0], item), data))  # type: ignore
    else:
        return data


class Clients:
    def __init__(self, cache: InMemoryCache):
        SERVER_URL = os.getenv("SERVER_URL")
        if SERVER_URL is None:
            raise Exception("SERVER_URL is not defined")
        self.SERVER_URL = SERVER_URL

        self.http_client: Optional[ClientSession] = None
        self.client: Optional[GQLSession] = None
        self.sub_client: Optional[GQLSession] = None

        self.cache = cache

    async def post(self, url: str, json: Optional[Any] = None) -> Any:
        if self.http_client is None:
            raise Exception("HTTP client is not initialized")

        async with self.http_client.post(url, json=json) as response:
            return await response.json()

    async def get(self, url: str) -> Any:
        if self.http_client is None:
            raise Exception("HTTP client is not initialized")

        async with self.http_client.get(url) as response:
            return await response.json()

    async def subscribe(
        self, data_type: Type[T], query: DocumentNode
    ) -> AsyncGenerator[Dict[str, T], None]:
        if self.sub_client is None:
            raise Exception("GraphQL client is not initialized")

        query_dict = query.to_dict()  # type: ignore
        selections = query_dict["definitions"][0]["selection_set"]["selections"]  # type: ignore
        query_name = selections[0]["name"]["value"]  # type: ignore

        async for data in self.sub_client.subscribe(query):
            data[query_name] = deserialize(data_type, data[query_name])  # type: ignore
            yield data

    async def execute(
        self,
        response_type: Type[T],
        query: DocumentNode,
        variables: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, T]:
        if self.client is None:
            raise Exception("GraphQL client is not initialized")

        query_dict = query.to_dict()  # type: ignore
        query_def = query_defs_to_field_table(query_dict)  # type: ignore

        definition = query_dict["definitions"][0]  # type: ignore
        query_type = definition["operation"]  # type: ignore

        is_query = query_type == "query"  # type: ignore

        # TODO: Check if variables is identical in cache
        if variables is None and is_query:
            response = await self.cache.read_query(response_type, query_def)
        else:
            response = None

        if response is None:
            if variables is not None:
                params: Dict[str, Any] = serialize(variables)
                response = await self.client.execute(query, variable_values=params)
            else:
                response = await self.client.execute(query)

            query_name = query_def[0]
            response[query_name] = deserialize(response_type, response[query_name])

            if is_query:
                await self.cache.write_query(response)

        return response

    async def open_http(self) -> None:
        await self.close_http()

        token_payload = {"token": state.token}

        # HTTP client
        self.http_client = ClientSession(self.SERVER_URL, cookies=token_payload)

    async def close_http(self) -> None:
        if self.http_client is not None:
            await self.http_client.close()

    async def restart_http(self) -> None:
        await self.close_http()
        await self.open_http()

    async def open_graphql(self) -> None:
        await self.close_graphql()

        token_payload = {"token": state.token}

        # GraphQL client
        transport = AIOHTTPTransport(
            url=f"{self.SERVER_URL}/graphql", cookies=token_payload
        )

        self.client = await Client(
            transport=transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)

        # GraphQL subscription client
        ws_url = self.SERVER_URL.replace("http", "ws")
        sub_transport = WebsocketsTransport(
            url=f"{ws_url}/graphql",
            subprotocols=[WebsocketsTransport.GRAPHQLWS_SUBPROTOCOL],
            init_payload=token_payload,
        )

        self.sub_client = await Client(
            transport=sub_transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)

    async def close_graphql(self) -> None:
        if self.client is not None:
            await self.client.client.close_async()

        if self.sub_client is not None:
            await self.sub_client.client.close_async()

    async def restart_graphql(self) -> None:
        await self.close_graphql()
        await self.open_graphql()


async def merge_pos_map(
    existing: Optional[QueryPosMapPayload], incoming: QueryPosMapPayload
) -> QueryPosMapPayload:
    posMap = pos_map_query_to_state(incoming)
    await set_pos_map(posMap)
    return incoming


async def merge_control_map(
    existing: Optional[QueryControlMapPayload], incoming: QueryControlMapPayload
) -> QueryControlMapPayload:
    controlMap = control_map_query_to_state(incoming)
    await set_control_map(controlMap)
    return incoming


async def merge_color_map(
    existing: Optional[QueryColorMapPayload], incoming: QueryColorMapPayload
) -> QueryColorMapPayload:
    colorMap = color_map_query_to_state(incoming)
    await set_color_map(colorMap)
    return incoming


client = Clients(
    cache=InMemoryCache(
        policies={
            "PosMap": TypePolicy(
                fields={
                    "frameIds": FieldPolicy(merge=merge_pos_map),
                }
            ),
            "ControlMap": TypePolicy(
                fields={
                    "frameIds": FieldPolicy(merge=merge_control_map),
                }
            ),
            "colorMap": TypePolicy(
                fields={
                    "colorMap": FieldPolicy(merge=merge_color_map),
                }
            ),
        }
    )
)
