import bpy

from ...core.actions.state.dopesheet import handle_select_timeline
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
    def poll(cls, context: bpy.types.Context | None):
        return state.ready and state.sync

    def draw(self, context: bpy.types.Context | None):
        layout = self.layout
        layout.enabled = not state.shifting and not state.requesting

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
            icon="LIGHTPROBE_VOLUME",
        )

        box = layout.box()

        row = box.row(align=True)
        row.operator(
            "lightdance.sync_map_updates",
            text="Control / Position",
            icon="UV_SYNC_SELECT",
        )
        row.operator(
            "lightdance.sync_color_updates",
            text="Color / Effect",
            icon="UV_SYNC_SELECT",
        )

        editing = state.edit_state == EditMode.EDITING

        if editing:
            row = box.row(align=True)
            row.label(text="Editing")
            row.operator("lightdance.save", text="Save", icon="CURRENT_FILE")
            row.operator("lightdance.cancel_edit", text="Cancel", icon="X")
        else:
            row = box.row(align=True)
            row.operator("lightdance.add", text="Add", icon="ADD")
            row.operator("lightdance.request_edit", text="Edit", icon="GREASEPENCIL")
            row.operator("lightdance.delete", text="Delete", icon="X")

        obj = None
        if bpy.context.selected_objects:
            obj = bpy.context.selected_objects[0]
        if obj or state.current_selected_obj_name:
            handle_select_timeline(obj)

        # TODO: Pin Dancer button
        # row = layout.row(align=True)
        # row.operator(
        #     "lightdance.pin_dancer",
        #     text="Pin Dancer",
        #     icon="PINNED"
        # )

        first_dancer = state.dancer_names[0]
        first_part = state.dancers[first_dancer][0]
        first_part_LED = [
            name for name in state.dancers[first_dancer] if name[-3:] == "LED"
        ][0]

        # FIXME: Delete this after testing
        if state.editor == Editor.CONTROL_EDITOR:
            row = layout.row(align=True)
            row.operator(
                "lightdance.toggle_test_ctrl_keyframe",
                text=f"Ctrl Frame of {first_dancer}'s {first_part}",
            )

        elif state.editor == Editor.POS_EDITOR:
            row = layout.row(align=True)
            row.operator(
                "lightdance.toggle_test_pos_keyframe",
                text=f"Pos Frame of {first_dancer}",
            )


def register():
    bpy.utils.register_class(EditorPanel)


def unregister():
    bpy.utils.unregister_class(EditorPanel)
