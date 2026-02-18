import bpy

from ...core.actions.state.dopesheet import (
    delete_obj,
    get_effective_name,
    update_pinned_ctrl_data,
    update_pinned_pos_data,
)
from ...core.models import EditMode, Editor
from ...core.states import state
from ...core.utils.notification import notify
from ...core.utils.ui import set_dopesheet_collapse_all


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
        obj = None
        if bpy.context.selected_objects:
            obj = bpy.context.selected_objects[0]

        if obj:
            if obj.name in state.pinned_objects:
                notify("INFO", f"{obj.name} already pinned")
            else:
                for i, obj_name in enumerate(state.pinned_objects):
                    eff_obj_name = get_effective_name(obj_name)
                    delete_obj(f"[{3 + i}]pinned_{eff_obj_name}")

                is_old_empty = True if not state.pinned_objects else False
                state.pinned_objects.append(obj.name)

                if state.editor == Editor.CONTROL_EDITOR:
                    update_pinned_ctrl_data(select=False, old_is_empty=is_old_empty)
                elif state.editor == Editor.POS_EDITOR:
                    update_pinned_pos_data(select=False, old_is_empty=is_old_empty)

                set_dopesheet_collapse_all(True)

                notify("INFO", f"{obj.name} pinned")

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
        notify("INFO", f"{state.pinned_objects[self.index]} is removed")
        for i, obj_name in enumerate(state.pinned_objects):
            eff_obj_name = get_effective_name(obj_name)
            delete_obj(f"[{3 + i}]pinned_{eff_obj_name}")

        state.pinned_objects.pop(self.index)

        if not state.pinned_objects:
            delete_obj("[2]blank")
        if state.editor == Editor.CONTROL_EDITOR:
            update_pinned_ctrl_data(select=False, old_is_empty=False)
        elif state.editor == Editor.POS_EDITOR:
            update_pinned_pos_data(select=False, old_is_empty=False)

        set_dopesheet_collapse_all(True)

        return {"FINISHED"}


def register():
    bpy.utils.register_class(PinObject)
    bpy.utils.register_class(DeletePinnedObject)


def unregister():
    bpy.utils.unregister_class(PinObject)
    bpy.utils.unregister_class(DeletePinnedObject)
