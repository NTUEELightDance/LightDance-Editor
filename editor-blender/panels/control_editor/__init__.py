from typing import cast

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
    fibers: list[bpy.types.Object] = []
    leds: list[bpy.types.Object] = []

    ld_no_status = False
    for part in dancer_obj.children:
        ld_object_type: str = getattr(part, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        ld_no_status = getattr(part, "ld_no_status")
        ld_light_type: str = getattr(part, "ld_light_type")
        if ld_light_type == LightType.FIBER.value:
            fibers.append(part)
        elif ld_light_type == LightType.LED.value:
            leds.append(part)

    if ld_no_status:
        row = layout.row()
        row.label(text="Current Dancer Has No Status")
        row = layout.row()
        row.label(text="Prev Status:")

    if ui_status.show_fiber or ui_status.show_all:
        for part in fibers:
            row = layout.row()
            ld_part_name: str = getattr(part, "ld_part_name")
            row.label(text=ld_part_name)
            if ld_no_status:
                row.prop(part, "ld_prev_color", text="")
                row.prop(part, "ld_prev_alpha", text="", slider=True)
            else:
                row.prop(part, "ld_color", text="")
                row.prop(part, "ld_alpha", text="", slider=True)

    if ui_status.show_led or ui_status.show_all:
        for part in leds:
            row = layout.row()
            ld_part_name: str = getattr(part, "ld_part_name")
            row.label(text=ld_part_name)

            if ld_no_status:
                row.prop(part, "ld_prev_effect", text="")
                if part["ld_prev_effect"] == 0:
                    op = row.operator("lightdance.toggle_led_focus", icon="VIEWZOOM")
                    setattr(op, "led_obj_name", part.name)
                else:
                    row.prop(part, "ld_prev_alpha", text="", slider=True)
            else:
                row.prop(part, "ld_effect", text="")
                if part["ld_effect"] == 0:
                    op = row.operator("lightdance.toggle_led_focus", icon="VIEWZOOM")
                    setattr(op, "led_obj_name", part.name)
                else:
                    row.prop(part, "ld_alpha", text="", slider=True)


def draw_dancer_effect_status(layout: bpy.types.UILayout, properties_enabled: bool):
    selected_dancers = []
    selected_dancers_name_list = []
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)
    for obj_name in state.selected_obj_names:
        obj = data_objects[obj_name]
        selected_dancer_name: str = getattr(obj, "ld_dancer_name")
        dancer_is_no_effect = getattr(obj, "ld_no_status")
        if selected_dancer_name not in selected_dancers_name_list:
            selected_dancers.append((selected_dancer_name, obj))
            selected_dancers_name_list.append(selected_dancer_name)

    selected_dancers.sort(key=lambda dancer: state.dancer_names.index(dancer[0]))

    for dancer_name, part_obj in selected_dancers:
        row = layout.row()
        row.enabled = properties_enabled
        row.label(text=dancer_name)
        row.prop(part_obj, "ld_no_status", text="", invert_checkbox=True)


def _draw_control_status(
    layout: bpy.types.UILayout,
    context: bpy.types.Context,
    ld_object_type: object,
    properties_enabled: bool,
    obj,
    ld_ui_control_editor,
):
    if ld_object_type == ObjectType.LIGHT.value:
        ld_part_name: str = getattr(context.object, "ld_part_name")
        row = layout.row()
        row.label(text=ld_part_name, icon="OBJECT_DATA")

        # show properties of light
        box = layout.box()
        column = box.column()
        column.enabled = properties_enabled

        ld_dancer_name = getattr(context.object, "ld_dancer_name")
        ld_no_status: bool = getattr(context.object, "ld_no_status")
        ld_light_type: str = getattr(context.object, "ld_light_type")

        if ld_light_type == LightType.FIBER.value:
            if ld_no_status:
                column.label(text=f"No Status")
                column.prop(context.object, "ld_prev_color", text="Prev Color")
                column.prop(
                    context.object, "ld_prev_alpha", text="Prev Alpha", slider=True
                )
                column.prop(context.object, "ld_prev_fade", text="Prev Fade")
            else:
                column.prop(context.object, "ld_color", text="Color")
                column.prop(context.object, "ld_alpha", text="Alpha", slider=True)
                column.prop(context.object, "ld_fade", text="Fade")
        elif ld_light_type == LightType.LED.value:
            if ld_no_status:
                column.label(text=f"No Status")
                column.prop(
                    context.object,
                    "ld_prev_effect",
                    text="Prev Effect",
                    icon="LIGHTPROBE_VOLUME",
                )
                column.prop(
                    context.object, "ld_prev_alpha", text="Prev Alpha", slider=True
                )
                if (
                    context.object
                    and not context.object["ld_no_status"]
                    and context.object["ld_effect"] == 0
                ):
                    op = column.operator(
                        "lightdance.toggle_led_focus",
                        text="Unfocus" if state.local_view else "Focus",
                        icon="VIEWZOOM",
                    )
                    setattr(op, "led_obj_name", context.object.name)
                column.prop(context.object, "ld_prev_fade", text="Prev Fade")
            else:
                column.prop(
                    context.object,
                    "ld_effect",
                    text="Effect",
                    icon="LIGHTPROBE_VOLUME",
                )
                column.prop(context.object, "ld_alpha", text="Alpha", slider=True)
                if context.object and context.object["ld_effect"] == 0:
                    op = column.operator(
                        "lightdance.toggle_led_focus",
                        text="Unfocus" if state.local_view else "Focus",
                        icon="VIEWZOOM",
                    )
                    setattr(op, "led_obj_name", context.object.name)
                column.prop(context.object, "ld_fade", text="Fade")
        elif (
            ld_light_type == LightType.LED_BULB.value
            and context.object
            and context.object.parent
        ):
            if ld_no_status:
                row = column.row()
                column.label(text=f"No Status")
                row.prop(
                    context.object.parent,
                    "ld_prev_effect",
                    text="Prev Effect",
                    icon="LIGHTPROBE_VOLUME",
                )
                row.prop(context.object, "ld_prev_color", text="Prev Color")
                row.prop(
                    context.object, "ld_prev_alpha", text="Prev Alpha", slider=True
                )
                column.prop(context.object, "ld_prev_fade", text="Prev Fade")
            else:
                row = column.row()
                row.prop(
                    context.object.parent,
                    "ld_effect",
                    text="Effect",
                    icon="LIGHTPROBE_VOLUME",
                )
                row.prop(context.object, "ld_color", text="Color")
                row.prop(context.object, "ld_alpha", text="Alpha", slider=True)
                row = column.row()
                op = row.operator(
                    "lightdance.toggle_led_focus",
                    text="Unfocus" if state.local_view else "Focus",
                    icon="VIEWZOOM",
                )
                setattr(op, "led_obj_name", context.object.parent.name)
                column.prop(context.object, "ld_fade", text="Fade")

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


def _draw_editing_control_status(
    layout: bpy.types.UILayout,
    context: bpy.types.Context,
    ld_object_type: object,
    properties_enabled: bool,
    obj,
    ld_ui_control_editor,
):
    if ld_object_type == ObjectType.LIGHT.value:
        ld_part_name: str = getattr(context.object, "ld_part_name")
        row = layout.row()
        row.label(text=ld_part_name, icon="OBJECT_DATA")

        ld_color, ld_alpha, ld_fade, ld_effect = (
            "ld_color",
            "ld_alpha",
            "ld_fade",
            "ld_effect",
        )
        ld_no_status = getattr(obj, "ld_no_status")
        if ld_no_status:
            ld_color, ld_alpha, ld_fade, ld_effect = (
                "ld_prev_color",
                "ld_prev_alpha",
                "ld_prev_fade",
                "ld_prev_effect",
            )

        # show properties of light
        box = layout.box()
        column = box.column()
        column.enabled = properties_enabled

        ld_dancer_name = getattr(context.object, "ld_dancer_name")
        ld_light_type: str = getattr(context.object, "ld_light_type")

        if ld_light_type == LightType.FIBER.value:
            column.prop(context.object, ld_color, text="Color")
            column.prop(context.object, ld_alpha, text="Alpha", slider=True)
            column.prop(context.object, ld_fade, text="Fade")
            column.prop(
                context.object, "ld_no_status", text="Has Status", invert_checkbox=True
            )
        elif ld_light_type == LightType.LED.value:
            column.prop(
                context.object,
                ld_effect,
                text="Effect",
                icon="LIGHTPROBE_VOLUME",
            )
            column.prop(context.object, ld_alpha, text="Alpha", slider=True)
            if (
                context.object
                and not context.object["ld_no_status"]
                and context.object["ld_effect"] == 0
            ):
                op = column.operator(
                    "lightdance.toggle_led_focus",
                    text="Unfocus" if state.local_view else "Focus",
                    icon="VIEWZOOM",
                )
                setattr(op, "led_obj_name", context.object.name)
            column.prop(context.object, ld_fade, text="Fade")
            column.prop(
                context.object, "ld_no_status", text="Has Status", invert_checkbox=True
            )
        elif (
            ld_light_type == LightType.LED_BULB.value
            and context.object
            and context.object.parent
        ):
            row = column.row()
            row.prop(
                context.object.parent,
                ld_effect,
                text="Effect",
                icon="LIGHTPROBE_VOLUME",
            )
            row.prop(context.object, ld_color, text="Color")
            row.prop(context.object, ld_alpha, text="Alpha", slider=True)
            row = column.row()
            op = row.operator(
                "lightdance.toggle_led_focus",
                text="Unfocus" if state.local_view else "Focus",
                icon="VIEWZOOM",
            )
            setattr(op, "led_obj_name", context.object.parent.name)
            column.prop(context.object, ld_fade, text="Fade")
            column.prop(
                context.object, "ld_no_status", text="Has Status", invert_checkbox=True
            )

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


class ControlEditor(bpy.types.Panel):
    bl_label = "Control"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_ControlEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context | None):
        return state.ready and state.sync and state.editor == Editor.CONTROL_EDITOR

    def draw(self, context: bpy.types.Context | None):
        if not context:
            return
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
        row.label(text="Default Fade: ")
        row.prop(context.window_manager, "ld_default_fade", text="")
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
            elif state.selected_obj_type == SelectedPartType.LED_BULB:
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
            # box = layout.box()
            # draw_dancer_effect_status(box, properties_enabled)

        else:
            obj = context.object
            if obj is None:  # type: ignore
                return

            ld_object_type: str = getattr(obj, "ld_object_type")

            if editing:
                _draw_editing_control_status(
                    layout,
                    context,
                    ld_object_type,
                    properties_enabled,
                    obj,
                    ld_ui_control_editor,
                )
            else:
                _draw_control_status(
                    layout,
                    context,
                    ld_object_type,
                    properties_enabled,
                    obj,
                    ld_ui_control_editor,
                )


def register():
    bpy.utils.register_class(ControlEditor)


def unregister():
    bpy.utils.unregister_class(ControlEditor)
