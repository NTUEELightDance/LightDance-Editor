import asyncio
import traceback
import inspect
from typing import (
    Any,
    Tuple,
    Dict,
    Callable,
    Coroutine,
    TypeVar,
    Generic
)

R = TypeVar("R")


class AsyncTask(Generic[R]):

    task: Callable[..., Coroutine[Any, Any, R]]
    then_callback: Callable[[R], Coroutine[Any, Any, None] | None] | None
    catch_callback: Callable[[Exception],
                             Coroutine[Any, Any, None] | None] | None

    args: Tuple[Any, ...]
    kwargs: Dict[str, Any]

    def __init__(self, task: Callable[..., Coroutine[Any, Any, R]], *args, **kwargs):
        self.task = task
        self.then_callback = None
        self.catch_callback = None

        self.args = args
        self.kwargs = kwargs

    async def __run__(self) -> None:
        try:
            result = await self.task(*self.args, **self.kwargs)
            if self.then_callback is not None:
                if inspect.iscoroutinefunction(self.then_callback):
                    await self.then_callback(result)
                else:
                    self.then_callback(result)
        except Exception as err:
            if self.catch_callback is not None:
                traceback.print_exc()
                if inspect.iscoroutinefunction(self.catch_callback):
                    await self.catch_callback(err)
                else:
                    self.catch_callback(err)

    def then(self, callback: Callable[[R], Coroutine[Any, Any, None] | None]) -> "AsyncTask[R]":
        self.then_callback = callback
        return self

    def catch(self, callback: Callable[[Exception], Coroutine[Any, Any, None] | None]) -> "AsyncTask[R]":
        self.catch_callback = callback
        return self

    def exec(self):
        asyncio.ensure_future(self.__run__())

