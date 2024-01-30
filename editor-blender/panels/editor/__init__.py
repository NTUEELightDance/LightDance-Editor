import bpy

from ...core.models import EditMode, Editor
from ...core.states import state


# TODO: Add icons
class EditorPanel(bpy.types.Panel):
    bl_label = "Editor"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_Editor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.enabled = not state.shifting

        row = layout.row(align=True)

        row.operator(
            "lightdance.toggle_control_editor",
            text="Control",
            depress=state.editor == Editor.CONTROL_EDITOR,
            icon="LIGHT_DATA",
        )
        row.operator(
            "lightdance.toggle_pos_editor",
            text="Position",
            depress=state.editor == Editor.POS_EDITOR,
            icon="TRANSFORM_ORIGINS",
        )
        row.operator(
            "lightdance.toggle_led_editor",
            text="LED",
            depress=state.editor == Editor.LED_EDITOR,
            icon="LIGHTPROBE_GRID",
        )

        box = layout.box()

        row = box.row()
        row.operator(
            "lightdance.sync_pending_updates",
            text="Sync incoming updates",
            icon="UV_SYNC_SELECT",
        )

        editing = state.edit_state == EditMode.EDITING

        if editing:
            row = box.row()
            row.label(text="Editing")
            row.operator("lightdance.save", text="Save", icon="CURRENT_FILE")
            row.operator("lightdance.cancel_edit", text="Cancel", icon="X")
        else:
            row = box.row()
            row.operator("lightdance.add", text="Add", icon="ADD")
            row.operator("lightdance.request_edit", text="Edit", icon="GREASEPENCIL")
            row.operator("lightdance.delete", text="Delete", icon="X")


def register():
    bpy.utils.register_class(EditorPanel)


def unregister():
    bpy.utils.unregister_class(EditorPanel)
