import bpy

from ...core.actions.state.color_map import apply_color_map_updates
from ...core.actions.state.control_editor import (
    add_control_frame,
    cancel_edit_control,
    delete_control_frame,
    request_edit_control,
    save_control_frame,
)
from ...core.actions.state.control_map import apply_control_map_updates
from ...core.actions.state.editor import set_editor
from ...core.actions.state.pos_editor import (
    add_pos_frame,
    cancel_edit_pos,
    delete_pos_frame,
    request_edit_pos,
    save_pos_frame,
)
from ...core.actions.state.pos_map import apply_pos_map_updates
from ...core.models import Editor
from ...core.states import state
from ...core.utils.notification import notify
from ...operators.async_core import AsyncOperator


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


class SyncPendingUpdates(bpy.types.Operator):
    """Sync Editor"""

    bl_idname = "lightdance.sync_pending_updates"
    bl_label = "Sync Pending Updates"

    def execute(self, context: bpy.types.Context):
        if state.control_map_pending:
            apply_control_map_updates()
        if state.pos_map_pending:
            apply_pos_map_updates()
        if state.color_map_pending:
            apply_color_map_updates()

        notify("INFO", "Synced pending updates")

        return {"FINISHED"}


class RequestEdit(AsyncOperator):
    """Request Edit"""

    bl_idname = "lightdance.request_edit"
    bl_label = "Request Edit"

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await request_edit_control()
            case Editor.POS_EDITOR:
                await request_edit_pos()
            case Editor.LED_EDITOR:
                pass


class Add(AsyncOperator):
    """Add"""

    bl_idname = "lightdance.add"
    bl_label = "Add"

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await add_control_frame()
            case Editor.POS_EDITOR:
                await add_pos_frame()
            case Editor.LED_EDITOR:
                pass


class Save(AsyncOperator):
    """Save"""

    bl_idname = "lightdance.save"
    bl_label = "Save"

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await save_control_frame()
            case Editor.POS_EDITOR:
                await save_pos_frame()
            case Editor.LED_EDITOR:
                pass


class Delete(AsyncOperator):
    """Delete"""

    bl_idname = "lightdance.delete"
    bl_label = "Delete"

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await delete_control_frame()
            case Editor.POS_EDITOR:
                await delete_pos_frame()
            case Editor.LED_EDITOR:
                pass


class CancelEdit(AsyncOperator):
    """Cancel Edit"""

    bl_idname = "lightdance.cancel_edit"
    bl_label = "Cancel Edit"

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await cancel_edit_control()
            case Editor.POS_EDITOR:
                await cancel_edit_pos()
            case Editor.LED_EDITOR:
                pass


def register():
    bpy.utils.register_class(ToggleControlEditor)
    bpy.utils.register_class(TogglePosEditor)
    bpy.utils.register_class(ToggleLEDEditor)
    bpy.utils.register_class(SyncPendingUpdates)
    bpy.utils.register_class(Add)
    bpy.utils.register_class(Save)
    bpy.utils.register_class(Delete)
    bpy.utils.register_class(RequestEdit)
    bpy.utils.register_class(CancelEdit)


def unregister():
    bpy.utils.unregister_class(ToggleControlEditor)
    bpy.utils.unregister_class(TogglePosEditor)
    bpy.utils.unregister_class(ToggleLEDEditor)
    bpy.utils.unregister_class(SyncPendingUpdates)
    bpy.utils.unregister_class(Add)
    bpy.utils.unregister_class(Save)
    bpy.utils.unregister_class(Delete)
    bpy.utils.unregister_class(RequestEdit)
    bpy.utils.unregister_class(CancelEdit)
