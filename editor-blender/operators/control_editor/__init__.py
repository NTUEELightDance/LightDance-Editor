import bpy

from ...core.actions.state.control_editor import (
    attach_editing_control_frame,
    toggle_dancer_mode,
    toggle_part_mode,
)


class AttachEditingControlFrame(bpy.types.Operator):
    bl_idname = "lightdance.attach_editing_control_frame"
    bl_label = "Attach to Editing Control Frame"

    def execute(self, context: bpy.types.Context):
        attach_editing_control_frame()

        return {"FINISHED"}


class ToggleDancerMode(bpy.types.Operator):
    bl_idname = "lightdance.toggle_dancer_mode"
    bl_label = "Toggle Dancer Mode"

    def execute(self, context: bpy.types.Context):
        toggle_dancer_mode()
        return {"FINISHED"}


class TogglePartMode(bpy.types.Operator):
    bl_idname = "lightdance.toggle_part_mode"
    bl_label = "Toggle Part Mode"

    def execute(self, context: bpy.types.Context):
        toggle_part_mode()
        return {"FINISHED"}


def register():
    bpy.utils.register_class(AttachEditingControlFrame)
    bpy.utils.register_class(ToggleDancerMode)
    bpy.utils.register_class(TogglePartMode)


def unregister():
    bpy.utils.unregister_class(AttachEditingControlFrame)
    bpy.utils.unregister_class(ToggleDancerMode)
    bpy.utils.unregister_class(TogglePartMode)
