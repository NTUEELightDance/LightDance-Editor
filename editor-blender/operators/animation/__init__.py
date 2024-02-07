import bpy

from ...core.actions.state.animation import start_playing, stop_playing
from ...core.actions.state.app_state import set_playing
from ...core.states import state

is_animation_status_listener_running = False


class AnimationStatusListenerOperator(bpy.types.Operator):
    bl_idname = "lightdance.animation_status_listener"
    bl_label = "Runs the asyncio main loop"

    def __del__(self):
        global is_animation_status_listener_running

        print("Stopping animation status listener...")

        if is_animation_status_listener_running and hasattr(self, "timer"):  # type: ignore
            wm = bpy.context.window_manager
            wm.event_timer_remove(self.timer)
            delattr(self, "timer")

        is_animation_status_listener_running = False

    def execute(self, context: bpy.types.Context):
        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context, _: bpy.types.Event):
        global is_animation_status_listener_running

        if is_animation_status_listener_running:
            return {"PASS_THROUGH"}

        context.window_manager.modal_handler_add(self)
        is_animation_status_listener_running = True

        wm = context.window_manager
        self.timer = wm.event_timer_add(0.001, window=context.window)

        print("Starting animation status listener...")

        return {"RUNNING_MODAL"}

    def modal(self, context: bpy.types.Context, event: bpy.types.Event):
        global is_animation_status_listener_running

        if not is_animation_status_listener_running:
            return {"FINISHED"}
        if event.type != "TIMER":
            return {"PASS_THROUGH"}

        is_animation_playing: bool = getattr(
            context.screen, "is_animation_playing", False
        )

        if not state.playing and is_animation_playing:
            # TODO: Start playing
            start_playing()
        elif state.playing and not is_animation_playing:
            # TODO: Stop playing
            stop_playing()

        set_playing(is_animation_playing)

        return {"RUNNING_MODAL"}


def register():
    bpy.utils.register_class(AnimationStatusListenerOperator)


def unregister():
    bpy.utils.unregister_class(AnimationStatusListenerOperator)
