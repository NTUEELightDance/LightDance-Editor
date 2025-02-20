import asyncio
import inspect
from collections.abc import Callable, Coroutine
from typing import Any, Generic, TypeVar

from ...core.log import logger

R = TypeVar("R")


class AsyncTask(Generic[R]):
    task: Callable[..., Coroutine[Any, Any, R]]
    then_callback: Callable[[R], Coroutine[Any, Any, None] | None] | None
    catch_callback: Callable[[Exception], Coroutine[Any, Any, None] | None] | None

    args: tuple[Any, ...]
    kwargs: dict[str, Any]

    def __init__(
        self, task: Callable[..., Coroutine[Any, Any, R]], *args: Any, **kwargs: Any
    ):
        self.task = task
        self.then_callback = None
        self.catch_callback = None

        self.args = args
        self.kwargs = kwargs

    async def __run__(self) -> None:
        try:
            self.__task__ = self.task(*self.args, **self.kwargs)
            result = await self.__task__
            if self.then_callback is not None:
                if inspect.iscoroutinefunction(self.then_callback):
                    await self.then_callback(result)
                else:
                    self.then_callback(result)

        except Exception as err:
            if self.catch_callback is not None:
                logger.exception("Failed to run task")
                if inspect.iscoroutinefunction(self.catch_callback):
                    await self.catch_callback(err)
                else:
                    self.catch_callback(err)

    def then(
        self, callback: Callable[[R], Coroutine[Any, Any, None] | None]
    ) -> "AsyncTask[R]":
        self.then_callback = callback
        return self

    def catch(
        self, callback: Callable[[Exception], Coroutine[Any, Any, None] | None]
    ) -> "AsyncTask[R]":
        self.catch_callback = callback
        return self

    def exec(self) -> asyncio.Task[Any]:
        return asyncio.ensure_future(self.__run__())
