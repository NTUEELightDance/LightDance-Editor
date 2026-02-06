import bpy

from ...core.actions.state.pos_editor import attach_editing_pos_frame
from ...properties.types import PositionPropertyType


class AttachEditingPosFrame(bpy.types.Operator):
    bl_idname = "lightdance.attach_editing_pos_frame"
    bl_label = "Attach to Editing Position Frame"

    def execute(self, context: bpy.types.Context | None):
        attach_editing_pos_frame()

        return {"FINISHED"}


class SetPosNone(bpy.types.Operator):
    bl_idname = "lightdance.set_pos_none"
    bl_label = "Set None"

    def execute(self, context: bpy.types.Context | None):
        if not context or not context.object:
            return {"CANCELLED"}

        pos: PositionPropertyType = getattr(context.object, "ld_position", None)
        if pos is None:
            return {"CANCELLED"}

        pos.is_none = True

        # FIXME: To make the UI clear, I tentatively set location and rotation to 0.
        pos.location = (0.0, 0.0, 0.0)
        pos.rotation = (0.0, 0.0, 0.0)

        return {"FINISHED"}


def register():
    bpy.utils.register_class(AttachEditingPosFrame)
    bpy.utils.register_class(SetPosNone)


def unregister():
    bpy.utils.unregister_class(AttachEditingPosFrame)
    bpy.utils.unregister_class(SetPosNone)
