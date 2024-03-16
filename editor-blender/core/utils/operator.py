import asyncio
import time
from typing import Any, Callable, Dict, Optional

import bpy

from ..asyncio import AsyncTask

slider_dragging_callback: Optional[Callable[[], None]] = None


def set_slider_dragging_callback(callback: Callable[[], None]):
    global slider_dragging_callback
    slider_dragging_callback = callback


def execute_slider_dragging_callback():
    global slider_dragging_callback
    if slider_dragging_callback is not None:
        slider_dragging_callback()
        slider_dragging_callback = None


def execute_operator(idname: str, **kwargs: Any):
    attrs = idname.split(".")
    if len(attrs) != 2:
        print("Invalid idname:", idname)
        return

    module_name, ops_name = attrs

    try:
        module = getattr(bpy.ops, module_name)
        ops: Callable[[str], Any] = getattr(module, ops_name)
        ops("INVOKE_DEFAULT", **kwargs)
        print("Executed operator:", idname)
    except:
        print("Failed to execute operator:", idname)


class Debounce:
    def __init__(self, action: Callable[[], None], delay: float):
        self.action = action
        self.delay = delay
        self.last_time = 0

    async def delayed_action(self, trigger_time: float):
        await asyncio.sleep(self.delay)
        if trigger_time == self.last_time:
            self.action()

    def trigger(self):
        self.last_time = time.time()
        AsyncTask(self.delayed_action, self.last_time).exec()
