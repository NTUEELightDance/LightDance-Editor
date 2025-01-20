import bpy

from ...core.actions.property.animation_data import (
    init_ctrl_keyframes_from_state,
    init_pos_keyframes_from_state,
)
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

        is_animation_status_listener_running = False

    def execute(self, context: bpy.types.Context | None):
        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context | None, event: bpy.types.Event):
        global is_animation_status_listener_running
        if not context:
            return {"CANCELLED"}

        if is_animation_status_listener_running:
            return {"PASS_THROUGH"}

        context.window_manager.modal_handler_add(self)
        is_animation_status_listener_running = True

        print("Starting animation status listener...")

        return {"RUNNING_MODAL"}

    def modal(self, context: bpy.types.Context | None, event: bpy.types.Event):
        global is_animation_status_listener_running
        if not context:
            return {"CANCELLED"}

        if not is_animation_status_listener_running:
            return {"FINISHED"}
        if event.type != "TIMER":
            return {"PASS_THROUGH"}

        is_animation_playing: bool = getattr(
            context.screen, "is_animation_playing", False
        )

        if not state.playing and is_animation_playing:
            start_playing()
        elif state.playing and not is_animation_playing:
            stop_playing()

        set_playing(is_animation_playing)

        return {"RUNNING_MODAL"}


class ResetAnimationOperator(bpy.types.Operator):
    bl_idname = "lightdance.reset_animation"
    bl_label = "Reset animation"

    def execute(self, context: bpy.types.Context | None):
        init_ctrl_keyframes_from_state()
        init_pos_keyframes_from_state()

        return {"FINISHED"}


def register():
    bpy.utils.register_class(AnimationStatusListenerOperator)
    bpy.utils.register_class(ResetAnimationOperator)


def unregister():
    bpy.utils.unregister_class(AnimationStatusListenerOperator)
    bpy.utils.unregister_class(ResetAnimationOperator)
