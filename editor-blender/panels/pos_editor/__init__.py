import bpy

from ...core.models import EditMode, Editor
from ...core.states import state
from ...properties.types import ObjectType, PositionPropertyType


class PosEditor(bpy.types.Panel):
    bl_label = "Position"
    bl_idname = "VIEW_PT_LightDance_PosEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        obj = context.object
        ld_object_type: str = getattr(obj, "ld_object_type")

        return (
            state.ready
            and state.editor == Editor.POS_EDITOR
            # and state.edit_state == EditMode.EDITING
            and ld_object_type == ObjectType.DANCER.value
        )

    def draw(self, context: bpy.types.Context):
        layout = self.layout

        position: PositionPropertyType = getattr(context.object, "ld_position")

        column = layout.column()
        column.prop(position, "transform", text="Transform")
        column.prop(position, "rotation", text="Rotation")


def register():
    bpy.utils.register_class(PosEditor)


def unregister():
    bpy.utils.unregister_class(PosEditor)
