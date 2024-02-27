from asyncio import Task
from time import time
from typing import Any, Optional

import bpy

from ...core.actions.state.ping import ping_server
from ...core.asyncio import AsyncTask
from ...core.states import state

is_ping_running = False


class PingOperator(bpy.types.Operator):
    bl_idname = "lightdance.ping"
    bl_label = "Keep ping alive"

    def __del__(self):
        global is_ping_running

        print("Stopping ping...")

        is_ping_running = False

    def execute(self, context: bpy.types.Context):
        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context, _: bpy.types.Event):
        global is_ping_running

        if is_ping_running:
            return {"PASS_THROUGH"}

        context.window_manager.modal_handler_add(self)
        is_ping_running = True

        self.last_ping_time = time()
        self.ping_interval = 5

        print("Starting ping...")

        return {"RUNNING_MODAL"}

    def modal(self, context: bpy.types.Context, event: bpy.types.Event):
        global is_ping_running

        if not is_ping_running:
            return {"FINISHED"}
        if event.type != "TIMER":
            return {"PASS_THROUGH"}

        interval = time() - self.last_ping_time
        if interval >= self.ping_interval:
            self.last_ping_time = time()

            if state.ready and state.sync:
                last_ping: Optional[Task[Any]] = getattr(self, "last_ping", None)
                if last_ping is None or last_ping.done():
                    self.last_ping = AsyncTask(ping_server).exec()

        return {"RUNNING_MODAL"}


def register():
    bpy.utils.register_class(PingOperator)


def unregister():
    bpy.utils.unregister_class(PingOperator)
