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
from ...core.actions.state.led_editor import (
    cancel_edit_led_effect,
    delete_led_effect,
    request_edit_led_effect,
    save_led_effect,
)
from ...core.actions.state.pos_editor import (
    add_pos_frame,
    cancel_edit_pos,
    delete_pos_frame,
    request_edit_pos,
    save_pos_frame,
)
from ...core.actions.state.pos_map import apply_pos_map_updates
from ...core.models import EditMode, Editor
from ...core.states import state
from ...core.utils.notification import notify
from ...operators.async_core import AsyncOperator
from ...properties.ui.types import LEDEditorStatusType


class ToggleControlEditor(bpy.types.Operator):
    """Toggle Control Editor"""

    bl_idname = "lightdance.toggle_control_editor"
    bl_label = "Toggle Control Editor"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return (
            state.edit_state != EditMode.EDITING
            or state.editor == Editor.CONTROL_EDITOR
        )

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

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.edit_state != EditMode.EDITING or state.editor == Editor.POS_EDITOR

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

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.edit_state != EditMode.EDITING or state.editor == Editor.LED_EDITOR

    def execute(self, context: bpy.types.Context):
        if set_editor(Editor.LED_EDITOR):
            notify("INFO", "Switched to LED Editor")
        else:
            notify("WARNING", "Cannot switch to LED Editor")

        return {"FINISHED"}


class SyncPendingUpdates(bpy.types.Operator):
    """Sync Editor"""

    bl_idname = "lightdance.sync_pending_updates"
    bl_label = "Sync Pending Updates"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return (
            state.color_map_pending
            or state.control_map_pending
            or state.pos_map_pending
        )

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

    @classmethod
    def poll(cls, context: bpy.types.Context):
        if state.editor == Editor.LED_EDITOR:
            ld_ui_led_editor: LEDEditorStatusType = getattr(
                bpy.context.window_manager, "ld_ui_led_editor"
            )
            return state.ready and ld_ui_led_editor.edit_effect != ""

        else:
            return state.ready

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await request_edit_control()
            case Editor.POS_EDITOR:
                await request_edit_pos()
            case Editor.LED_EDITOR:
                await request_edit_led_effect()


class Add(AsyncOperator):
    """Add"""

    bl_idname = "lightdance.add"
    bl_label = "Add"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        if state.editor == Editor.LED_EDITOR:
            ld_ui_led_editor: LEDEditorStatusType = getattr(
                bpy.context.window_manager, "ld_ui_led_editor"
            )
            return state.ready and ld_ui_led_editor.edit_part != ""

        else:
            return state.ready

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
    bl_options = {"REGISTER", "UNDO"}

    modify_start: bpy.props.BoolProperty(  # type: ignore
        name="Modify start time",
        default=False,
    )

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        modify_start: bool = getattr(self, "modify_start")

        if modify_start:
            setattr(self, "modify_start", False)

            match state.editor:
                case Editor.CONTROL_EDITOR:
                    await save_control_frame(start=bpy.context.scene.frame_current)
                case Editor.POS_EDITOR:
                    await save_pos_frame(start=bpy.context.scene.frame_current)
                case Editor.LED_EDITOR:
                    await save_led_effect()

        else:
            match state.editor:
                case Editor.CONTROL_EDITOR:
                    await save_control_frame()
                case Editor.POS_EDITOR:
                    await save_pos_frame()
                case Editor.LED_EDITOR:
                    await save_led_effect()

    def invoke(self, context: bpy.types.Context, event: bpy.types.Event):
        if (
            state.editor == Editor.CONTROL_EDITOR and state.current_editing_detached
        ) or (state.editor == Editor.POS_EDITOR and state.current_editing_detached):
            return context.window_manager.invoke_props_dialog(self)

        return self.execute(context)


class Delete(AsyncOperator):
    """Delete"""

    bl_idname = "lightdance.delete"
    bl_label = "Delete"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        if state.editor == Editor.LED_EDITOR:
            ld_ui_led_editor: LEDEditorStatusType = getattr(
                bpy.context.window_manager, "ld_ui_led_editor"
            )
            return state.ready and ld_ui_led_editor.edit_effect != ""

        else:
            return state.ready

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await delete_control_frame()
            case Editor.POS_EDITOR:
                await delete_pos_frame()
            case Editor.LED_EDITOR:
                await delete_led_effect()


class CancelEdit(AsyncOperator):
    """Cancel Edit"""

    bl_idname = "lightdance.cancel_edit"
    bl_label = "Cancel Edit"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                await cancel_edit_control()
            case Editor.POS_EDITOR:
                await cancel_edit_pos()
            case Editor.LED_EDITOR:
                await cancel_edit_led_effect()


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
