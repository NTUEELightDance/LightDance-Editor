import bpy

from ...core.actions.state.dopesheet import handle_select_timeline
from ...core.models import EditMode, Editor
from ...core.states import state
from ...core.utils.notification import notify
from ...properties.types import LightType, ObjectType


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

            obj = (
                bpy.context.selected_objects[0]
                if bpy.context.selected_objects
                else None
            )

            if obj:
                ld_object_type = getattr(obj, "ld_object_type")
                ld_light_type = getattr(obj, "ld_light_type")

                if (
                    ld_object_type == ObjectType.LIGHT.value
                    and state.current_selected_obj_name != obj.name
                    and not obj.name.startswith("Selected_")
                ):
                    if ld_light_type == LightType.LED.value:
                        current_obj_name = f"{obj.name}.000"
                    else:
                        current_obj_name = obj.name

                    if state.current_selected_obj_name:
                        if state.current_selected_obj_name.endswith("_LED"):
                            old_selected_obj_name = (
                                f"{state.current_selected_obj_name}.000"
                            )
                        else:
                            old_selected_obj_name = state.current_selected_obj_name
                    else:
                        old_selected_obj_name = ""

                    notify("INFO", f"Selected obj is {current_obj_name}")
                    notify(
                        "INFO", f"Old selected obj is {state.current_selected_obj_name}"
                    )
                    state.current_selected_obj_name = obj.name
                    handle_select_timeline(current_obj_name, old_selected_obj_name)

            else:
                if state.current_selected_obj_name:
                    if state.current_selected_obj_name.endswith("_LED"):
                        old_selected_obj_name = f"{state.current_selected_obj_name}.000"
                    else:
                        old_selected_obj_name = state.current_selected_obj_name
                    notify("INFO", f"Selected obj is None")
                    notify(
                        "INFO", f"Old selected obj is {state.current_selected_obj_name}"
                    )
                    state.current_selected_obj_name = None
                    handle_select_timeline("", old_selected_obj_name)

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
