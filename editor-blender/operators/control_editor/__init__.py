import bpy

from ...core.actions.state.control_editor import attach_editing_control_frame


class AttachEditingControlFrame(bpy.types.Operator):
    bl_idname = "lightdance.attach_editing_control_frame"
    bl_label = "Attach to Editing Control Frame"

    def execute(self, context: bpy.types.Context):
        attach_editing_control_frame()

        return {"FINISHED"}


def register():
    bpy.utils.register_class(AttachEditingControlFrame)


def unregister():
    bpy.utils.unregister_class(AttachEditingControlFrame)
