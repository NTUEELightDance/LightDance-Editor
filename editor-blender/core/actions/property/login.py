import bpy


from ...states import states


def update_is_running(self: bpy.types.WindowManager, context: bpy.types.Context):
    states.is_running = getattr(
        context.window_manager, "ld_is_runnning", False)
