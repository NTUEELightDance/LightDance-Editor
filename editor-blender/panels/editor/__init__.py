import bpy

from ...core.models import EditMode, Editor
from ...core.states import state


# TODO: Add icons
class EditorPanel(bpy.types.Panel):
    bl_label = "Editor"
    bl_idname = "VIEW_PT_LightDance_Editor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def draw(self, context: bpy.types.Context):
        editing = state.edit_state == EditMode.EDITING

        layout = self.layout
        row = layout.row(align=True)

        row.operator(
            "lightdance.toggle_control_editor",
            text="Control",
            depress=state.editor == Editor.CONTROL_EDITOR,
        )
        row.operator(
            "lightdance.toggle_pos_editor",
            text="Position",
            depress=state.editor == Editor.POS_EDITOR,
        )
        row.operator(
            "lightdance.toggle_led_editor",
            text="LED",
            depress=state.editor == Editor.LED_EDITOR,
        )

        sync_enable = (
            state.color_map_pending
            or state.control_map_pending
            or state.pos_map_pending
        )

        box = layout.box()
        row = box.row()
        row.operator("lightdance.sync_pending_updates", text="Sync incoming updates")
        row.enabled = sync_enable

        if editing:
            row = box.row()
            row.label(text="Editing")
            row.operator("lightdance.save", text="Save")
            row.operator("lightdance.cancel_edit", text="Cancel")
        else:
            row = box.row()
            row.operator("lightdance.add", text="Add")
            row.operator("lightdance.request_edit", text="Edit")
            row.operator("lightdance.delete", text="Delete")


def register():
    bpy.utils.register_class(EditorPanel)


def unregister():
    bpy.utils.unregister_class(EditorPanel)
