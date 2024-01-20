import bpy

from ...core.actions.state.editor import set_editor
from ...core.models import Editor
from ...core.utils.notification import notify


class ToggleControlEditor(bpy.types.Operator):
    """Toggle Control Editor"""

    bl_idname = "lightdance.toggle_control_editor"
    bl_label = "Toggle Control Editor"

    def execute(self, context: bpy.types.Context):
        if set_editor(Editor.CONTROL_EDITOR):
            notify("INFO", "Switched to Control Editor")
        else:
            notify("WARNING", "Cannot switch to Control Editor")

        return {"FINISHED"}


class TogglePosEditor(bpy.types.Operator):
    """Toggle Position Editor"""

    bl_idname = "lightdance.toggle_pos_editor"
    bl_label = "Toggle Position Editor"

    def execute(self, context: bpy.types.Context):
        if set_editor(Editor.POS_EDITOR):
            notify("INFO", "Switched to Position Editor")
        else:
            notify("WARNING", "Cannot switch to Position Editor")

        return {"FINISHED"}


class ToggleLEDEditor(bpy.types.Operator):
    """Toggle LED Editor"""

    bl_idname = "lightdance.toggle_led_editor"
    bl_label = "Toggle LED Editor"

    def execute(self, context: bpy.types.Context):
        # TODO: Toggle LED editor selection panel
        if set_editor(Editor.LED_EDITOR):
            notify("INFO", "Switched to LED Editor")
        else:
            notify("WARNING", "Cannot switch to LED Editor")

        return {"FINISHED"}


def register():
    bpy.utils.register_class(ToggleControlEditor)
    bpy.utils.register_class(TogglePosEditor)
    bpy.utils.register_class(ToggleLEDEditor)


def unregister():
    bpy.utils.unregister_class(ToggleControlEditor)
    bpy.utils.unregister_class(TogglePosEditor)
    bpy.utils.unregister_class(ToggleLEDEditor)
