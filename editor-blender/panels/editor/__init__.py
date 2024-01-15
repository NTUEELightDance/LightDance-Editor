import bpy

from ...core.models import Editor
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
        layout = self.layout
        row = layout.row()

        c1 = row.split()
        c1.operator(
            "lightdance.toggle_control_editor",
            text="Control",
            depress=state.editor == Editor.CONTROL_EDITOR,
        )
        c2 = row.split()
        c2.operator(
            "lightdance.toggle_pos_editor",
            text="Scene",
            depress=state.editor == Editor.POS_EDITOR,
        )
        c3 = row.split()
        c3.operator(
            "lightdance.toggle_led_editor",
            text="LED",
            depress=state.editor == Editor.LED_EDITOR,
        )


def register():
    bpy.utils.register_class(EditorPanel)


def unregister():
    bpy.utils.unregister_class(EditorPanel)
