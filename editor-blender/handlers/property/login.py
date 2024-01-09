import bpy

from ...core.states import state


def update_is_running(self: bpy.types.WindowManager, context: bpy.types.Context):
    state.is_running = getattr(context.window_manager, "ld_is_runnning", False)
