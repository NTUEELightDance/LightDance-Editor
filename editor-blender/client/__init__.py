import asyncio
from asyncio import Task
from inspect import isclass
from typing import Any, AsyncGenerator, Dict, Optional, Type, TypeVar, Union

from aiohttp import ClientSession
from dataclass_wizard import JSONWizard
from dataclass_wizard.constants import os
from gql import Client
from gql.client import AsyncClientSession, ReconnectingAsyncClientSession
from gql.transport.aiohttp import AIOHTTPTransport
from gql.transport.websockets import WebsocketsTransport
from graphql import DocumentNode

from ..core.states import state
from .cache import InMemoryCache, query_defs_to_field_table

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


def remove_wrapped_slash(path: str) -> str:
    if path.startswith("/"):
        return path[1:]
    return path


class Clients:
    def __init__(self):
        SERVER_URL = os.getenv("SERVER_URL")
        if SERVER_URL is None:
            raise Exception("SERVER_URL is not defined")
        self.SERVER_URL = remove_wrapped_slash(SERVER_URL)

        HTTP_PATH = os.getenv("HTTP_PATH")
        if HTTP_PATH is None:
            raise Exception("HTTP_PATH is not defined")
        self.HTTP_PATH = remove_wrapped_slash(HTTP_PATH)

        GRAPHQL_PATH = os.getenv("GRAPHQL_PATH")
        if GRAPHQL_PATH is None:
            raise Exception("GRAPHQL_PATH is not defined")
        self.GRAPHQL_PATH = remove_wrapped_slash(GRAPHQL_PATH)

        GRAPHQL_WS_PATH = os.getenv("GRAPHQL_WS_PATH")
        if GRAPHQL_WS_PATH is None:
            raise Exception("GRAPHQL_WS_PATH is not defined")
        self.GRAPHQL_WS_PATH = remove_wrapped_slash(GRAPHQL_WS_PATH)

        FILE_SERVER_URL = os.getenv("FILE_SERVER_URL")
        if FILE_SERVER_URL is None:
            raise Exception("FILE_SERVER_URL is not defined")
        self.FILE_SERVER_URL = remove_wrapped_slash(FILE_SERVER_URL)

        self.http_client: Optional[ClientSession] = None
        self.client: Optional[GQLSession] = None
        self.sub_client: Optional[GQLSession] = None
        self.file_client: Optional[ClientSession] = None

        self.cache = InMemoryCache()

    async def __timeout__(self, task: Task[Any], timeout: int) -> None:
        await asyncio.sleep(timeout / 1000.0)
        if not task.done():
            task.cancel()

    async def download_json(self, path: str) -> Any:
        if self.file_client is None:
            raise Exception("File client is not initialized")

        path = remove_wrapped_slash(path)
        http_path = f"/{path}"
        print(http_path)
        async with self.file_client.get(http_path) as response:
            return await response.json()

    async def download_binary(self, path: str) -> bytes:
        if self.file_client is None:
            raise Exception("File client is not initialized")

        path = remove_wrapped_slash(path)
        http_path = f"/{path}"
        print(http_path)
        async with self.file_client.get(http_path) as response:
            return await response.content.read()

    async def __post__(self, path: str, json: Optional[Any] = None) -> Any:
        if self.http_client is None:
            raise Exception("HTTP client is not initialized")

        path = remove_wrapped_slash(path)
        http_path = f"/{self.HTTP_PATH}/{path}"
        async with self.http_client.post(http_path, json=json) as response:
            return await response.json()

    async def post(
        self, path: str, json: Optional[Any] = None, timeout: int = 1000
    ) -> Any:
        task = asyncio.ensure_future(self.__post__(path, json))
        asyncio.ensure_future(self.__timeout__(task, timeout))

        result = await task
        return result

    async def __get__(self, path: str) -> Any:
        if self.http_client is None:
            raise Exception("HTTP client is not initialized")

        path = remove_wrapped_slash(path)
        http_path = f"/{self.HTTP_PATH}/{path}"
        async with self.http_client.get(http_path) as response:
            return await response.json()

    async def get(
        self, path: str, json: Optional[Any] = None, timeout: int = 1000
    ) -> Any:
        task = asyncio.ensure_future(self.__get__(path))
        asyncio.ensure_future(self.__timeout__(task, timeout))

        result = await task
        return result

    def configure_cache(self, cache: InMemoryCache) -> None:
        self.cache = cache

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

    async def __execute__(
        self,
        document: DocumentNode,
        variable_values: Optional[Dict[str, Any]] = None,
        timeout: int = 3000,
    ) -> Dict[str, Any]:
        if self.client is None:
            raise Exception("GraphQL client is not initialized")

        task = asyncio.ensure_future(
            self.client.execute(document, variable_values=variable_values)
        )
        asyncio.ensure_future(self.__timeout__(task, timeout))

        result = await task
        return result

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
                response = await self.__execute__(query, variable_values=params)
            else:
                response = await self.__execute__(query)

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
        print("HTTP client opened")

    async def close_http(self) -> None:
        if self.http_client is not None:
            await self.http_client.close()

    async def restart_http(self) -> None:
        await self.close_http()
        await self.open_http()

    async def open_file(self) -> None:
        # File client
        self.file_client = ClientSession(self.FILE_SERVER_URL)
        print("File client opened")

    async def close_file(self) -> None:
        if self.file_client is not None:
            await self.file_client.close()

    async def restart_file(self) -> None:
        await self.close_file()
        await self.open_file()

    async def open_graphql(self) -> None:
        await self.close_graphql()

        token_payload = {"token": state.token}

        # GraphQL client
        transport = AIOHTTPTransport(
            url=f"{self.SERVER_URL}/{self.GRAPHQL_PATH}", cookies=token_payload
        )

        self.client = await Client(
            transport=transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)
        print("GraphQL client opened")

        # GraphQL subscription client
        ws_url = self.SERVER_URL.replace("http", "ws")
        sub_transport = WebsocketsTransport(
            url=f"{ws_url}/{self.GRAPHQL_WS_PATH}",
            subprotocols=[WebsocketsTransport.GRAPHQLWS_SUBPROTOCOL],
            init_payload=token_payload,
        )

        self.sub_client = await Client(
            transport=sub_transport, fetch_schema_from_transport=False
        ).connect_async(reconnecting=True)
        print("GraphQL subscription client opened")

    async def close_graphql(self) -> None:
        if self.client is not None:
            await self.client.client.close_async()

        if self.sub_client is not None:
            await self.sub_client.client.close_async()

    async def restart_graphql(self) -> None:
        await self.close_graphql()
        await self.open_graphql()


client = Clients()
