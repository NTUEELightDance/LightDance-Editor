from typing import List

import bpy

from ...core.models import EditMode, Editor, SelectedPartType, SelectMode
from ...core.states import state
from ...properties.types import LightType, ObjectType
from ...properties.ui.types import ControlEditorStatusType


def draw_dancer_parts(
    layout: bpy.types.UILayout,
    dancer_obj: bpy.types.Object,
    ui_status: ControlEditorStatusType,
):
    fibers: List[bpy.types.Object] = []
    leds: List[bpy.types.Object] = []

    for part in dancer_obj.children:
        ld_object_type: str = getattr(part, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        ld_light_type: str = getattr(part, "ld_light_type")
        if ld_light_type == LightType.FIBER.value:
            fibers.append(part)
        elif ld_light_type == LightType.LED.value:
            leds.append(part)

    if ui_status.show_fiber or ui_status.show_all:
        for part in fibers:
            row = layout.row()
            ld_part_name: str = getattr(part, "ld_part_name")
            row.label(text=ld_part_name)
            row.prop(part, "ld_color", text="")
            row.prop(part, "ld_alpha", text="", slider=True)

    if ui_status.show_led or ui_status.show_all:
        for part in leds:
            row = layout.row()
            ld_part_name: str = getattr(part, "ld_part_name")
            row.label(text=ld_part_name)
            row.prop(part, "ld_effect", text="")
            row.prop(part, "ld_alpha", text="", slider=True)


class ControlEditor(bpy.types.Panel):
    bl_label = "Control"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_ControlEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready and state.sync and state.editor == Editor.CONTROL_EDITOR

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.enabled = not state.shifting and not state.requesting

        row = layout.row()
        row.label(text="Control Editor")

        editing = state.edit_state == EditMode.EDITING
        properties_enabled = editing and not state.playing

        split = row.split()
        row = split.row(align=True)
        row.operator(
            "lightdance.toggle_dancer_mode",
            icon="POSE_HLT",
            text="",
            depress=state.selection_mode == SelectMode.DANCER_MODE,
        )
        row.operator(
            "lightdance.toggle_part_mode",
            icon="OBJECT_DATA",
            text="",
            depress=state.selection_mode == SelectMode.PART_MODE,
        )

        row = split.row()
        row.label(text="Fade: ")
        row.prop(context.window_manager, "ld_fade", text="")
        row.enabled = editing

        if state.current_editing_detached and editing:
            row = layout.row()
            row.enabled = not state.playing
            row.label(text="Detached", icon="ERROR")
            row.operator("lightdance.attach_editing_control_frame", icon="PLAY")

        ld_ui_control_editor: ControlEditorStatusType = getattr(
            context.window_manager, "ld_ui_control_editor"
        )

        if ld_ui_control_editor.multi_select:
            # show properties of light
            box = layout.box()
            column = box.column()
            column.enabled = properties_enabled

            if state.selected_obj_type == SelectedPartType.FIBER:
                column.prop(ld_ui_control_editor, "multi_select_color", text="Color")
                column.prop(
                    ld_ui_control_editor,
                    "multi_select_alpha",
                    text="Alpha",
                    slider=True,
                )
            else:
                column.prop(ld_ui_control_editor, "multi_select_effect", text="Effect")
                column.prop(
                    ld_ui_control_editor,
                    "multi_select_alpha",
                    text="Alpha",
                    slider=True,
                )

        else:
            obj = context.object
            if obj is None:  # type: ignore
                return

            ld_object_type: str = getattr(obj, "ld_object_type")

            if ld_object_type == ObjectType.LIGHT.value:
                ld_part_name: str = getattr(context.object, "ld_part_name")
                row = layout.row()
                row.label(text=ld_part_name, icon="OBJECT_DATA")

                # show properties of light
                box = layout.box()
                column = box.column()
                column.enabled = properties_enabled

                ld_light_type: str = getattr(context.object, "ld_light_type")
                if ld_light_type == LightType.FIBER.value:
                    column.prop(context.object, "ld_color", text="Color")
                    column.prop(context.object, "ld_alpha", text="Alpha", slider=True)
                elif ld_light_type == LightType.LED.value:
                    column.prop(
                        context.object,
                        "ld_effect",
                        text="Effect",
                        icon="LIGHTPROBE_VOLUME",
                    )
                    column.prop(context.object, "ld_alpha", text="Alpha", slider=True)

            elif ld_object_type == ObjectType.DANCER.value:
                ld_dancer_name: str = getattr(context.object, "ld_dancer_name")
                row = layout.row()
                row.label(text=ld_dancer_name, icon="POSE_HLT")

                row = layout.row(align=True)
                row.prop(ld_ui_control_editor, "show_fiber", toggle=True, text="FIBER")
                row.prop(ld_ui_control_editor, "show_led", toggle=True, text="LED")
                row.prop(ld_ui_control_editor, "show_all", toggle=True, text="ALL")

                box = layout.box()
                box.enabled = properties_enabled
                draw_dancer_parts(box, obj, ld_ui_control_editor)


def register():
    bpy.utils.register_class(ControlEditor)


def unregister():
    bpy.utils.unregister_class(ControlEditor)
