import bpy

from ...core.actions.state.clipboard import (
    copy_control_frame,
    copy_dancer,
    copy_part,
    copy_pos_frame,
    paste_control_frame,
    paste_dancer,
    paste_part,
    paste_pos_frame,
)
from ...core.models import CopiedType, EditMode, Editor, SelectMode
from ...core.states import state
from ...core.utils.notification import notify
from ...operators.async_core import AsyncOperator

# TODO: Add base model to dancer for varification


class CopyOperator(bpy.types.Operator):
    bl_idname = "lightdance.copy"
    bl_label = "Copy"

    def execute(self, context: bpy.types.Context | None):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", "Not Control Editor")
            return {"FINISHED"}

        if state.selection_mode == SelectMode.DANCER_MODE:
            copy_dancer()

        elif state.selection_mode == SelectMode.PART_MODE:
            copy_part()

        notify("INFO", "Copied")

        return {"FINISHED"}


class PasteOperator(AsyncOperator):
    bl_idname = "lightdance.paste"
    bl_label = "Paste"
    # bl_options = {"REGISTER", "UNDO"}

    async def async_execute(self, context: bpy.types.Context | None):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", f"Not Control Editor")
            return {"FINISHED"}

        clipboard = state.clipboard
        if clipboard.type == CopiedType.NONE:
            notify("INFO", f"Not copied yet")
            return {"FINISHED"}

        if state.selection_mode == SelectMode.DANCER_MODE:
            if not (await paste_dancer()):
                return {"CANCELLED"}

        elif state.selection_mode == SelectMode.PART_MODE:
            if not (await paste_part()):
                return {"CANCELLED"}

        notify("INFO", f"Pasted")

        return {"FINISHED"}


class CopyFrameOperator(bpy.types.Operator):
    bl_idname = "lightdance.copy_frame"
    bl_label = "Copy"

    @classmethod
    def poll(cls, context: bpy.types.Context | None):
        return state.edit_state == EditMode.IDLE

    def execute(self, context: bpy.types.Context | None):
        if state.edit_state != EditMode.IDLE:
            notify("INFO", f"Not allowed in Edit Mode")
            return {"CANCELLED"}

        if state.editor == Editor.CONTROL_EDITOR:
            copy_control_frame()

        elif state.editor == Editor.POS_EDITOR:
            copy_pos_frame()

        notify("INFO", f"Copied")

        return {"FINISHED"}


class PasteFrameOperator(AsyncOperator):
    bl_idname = "lightdance.paste_frame"
    bl_label = "Paste"

    confirm_add: bpy.props.BoolProperty(name="Add a new frame here", default=False)  # type: ignore

    @classmethod
    def poll(cls, context: bpy.types.Context | None):
        return state.edit_state == EditMode.IDLE and (
            (
                state.editor == Editor.CONTROL_EDITOR
                and state.clipboard.type == CopiedType.CONTROL_FRAME
            )
            or (
                state.editor == Editor.POS_EDITOR
                and state.clipboard.type == CopiedType.POS_FRAME
            )
        )

    async def async_execute(self, context: bpy.types.Context):
        confirm_add: bool = getattr(self, "confirm_add")

        if state.editor == Editor.CONTROL_EDITOR:
            await paste_control_frame(confirm_add)

        elif state.editor == Editor.POS_EDITOR:
            await paste_pos_frame(confirm_add)

        notify("INFO", f"Pasted")

        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context | None, event: bpy.types.Event):
        if state.edit_state != EditMode.IDLE:
            notify("INFO", f"Not allowed in Edit Mode")
            return {"CANCELLED"}

        if not context:
            return {"CANCELLED"}

        clipboard = state.clipboard

        if state.editor == Editor.CONTROL_EDITOR:
            if clipboard.control_frame is None:
                return {"CANCELLED"}

            current_index = state.current_control_index
            current_frame_id = state.control_record[current_index]
            current_frame = state.control_map[current_frame_id]

            frame_current = context.scene.frame_current

            if frame_current != current_frame.start:
                return context.window_manager.invoke_props_dialog(self)

        elif state.editor == Editor.POS_EDITOR:
            if clipboard.pos_frame is None:
                return {"CANCELLED"}

            current_index = state.current_pos_index
            current_frame_id = state.pos_record[current_index]
            current_frame = state.pos_map[current_frame_id]

            frame_current = context.scene.frame_current

            if frame_current != current_frame.start:
                return context.window_manager.invoke_props_dialog(self)

        return self.execute(context)


def register():
    bpy.utils.register_class(CopyOperator)
    bpy.utils.register_class(PasteOperator)
    bpy.utils.register_class(CopyFrameOperator)
    bpy.utils.register_class(PasteFrameOperator)


def unregister():
    bpy.utils.unregister_class(CopyOperator)
    bpy.utils.unregister_class(PasteOperator)
    bpy.utils.unregister_class(CopyFrameOperator)
    bpy.utils.unregister_class(PasteFrameOperator)
