import bpy

from ...core.actions.state.pos_editor import attach_editing_pos_frame


class AttachEditingPosFrame(bpy.types.Operator):
    bl_idname = "lightdance.attach_editing_pos_frame"
    bl_label = "Attach to Editing Position Frame"

    def execute(self, context: bpy.types.Context | None):
        attach_editing_pos_frame()

        return {"FINISHED"}


def register():
    bpy.utils.register_class(AttachEditingPosFrame)


def unregister():
    bpy.utils.unregister_class(AttachEditingPosFrame)
