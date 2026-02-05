import bpy

from ...core.actions.state.dopesheet import (
    handle_delete_pinned_object,
    handle_pinned_object,
)
from ...core.models import EditMode, Editor
from ...core.states import state


class PinObject(bpy.types.Operator):
    """Pin Object"""

    bl_idname = "lightdance.pin_object"
    bl_label = "Pin Object"

    @classmethod
    def poll(cls, context: bpy.types.Context | None):
        return state.edit_state != EditMode.EDITING and (
            state.editor == Editor.CONTROL_EDITOR or state.editor == Editor.POS_EDITOR
        )

    def execute(self, context: bpy.types.Context | None):
        handle_pinned_object()
        return {"FINISHED"}


class DeletePinnedObject(bpy.types.Operator):
    """Delete Pinned Object"""

    bl_idname = "lightdance.delete_pinned_object"
    bl_label = "Delete Pinned Object"

    index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context: bpy.types.Context | None):
        return state.edit_state != EditMode.EDITING and (
            state.editor == Editor.CONTROL_EDITOR or state.editor == Editor.POS_EDITOR
        )

    def execute(self, context: bpy.types.Context | None):
        handle_delete_pinned_object(self.index)
        return {"FINISHED"}


def register():
    bpy.utils.register_class(PinObject)
    bpy.utils.register_class(DeletePinnedObject)


def unregister():
    bpy.utils.unregister_class(PinObject)
    bpy.utils.unregister_class(DeletePinnedObject)
