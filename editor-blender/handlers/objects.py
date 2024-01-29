from typing import Dict, List

import bpy

from ..core.models import Editor, SelectedPartType
from ..core.states import state
from ..properties.types import LightType, ObjectType
from ..properties.ui.types import (
    ControlEditorStatusType,
    LEDEditorEditModeType,
    LEDEditorStatusType,
    PosEditorStatusType,
)

# TODO: Please make this bullshit cleaner


def is_light(obj: bpy.types.Object) -> bool:
    return getattr(obj, "ld_object_type") == ObjectType.LIGHT.value


def is_led(obj: bpy.types.Object) -> bool:
    return (
        getattr(obj, "ld_object_type") == ObjectType.LIGHT.value
        and getattr(obj, "ld_light_type") == LightType.LED.value
    )


def is_led_bulb(obj: bpy.types.Object) -> bool:
    return (
        getattr(obj, "ld_object_type") == ObjectType.LIGHT.value
        and getattr(obj, "ld_light_type") == LightType.LED_BULB.value
    )


def is_fiber(obj: bpy.types.Object) -> bool:
    return (
        getattr(obj, "ld_object_type") == ObjectType.LIGHT.value
        and getattr(obj, "ld_light_type") == LightType.FIBER.value
    )


def is_dancer(obj: bpy.types.Object) -> bool:
    return getattr(obj, "ld_object_type") == ObjectType.DANCER.value


def is_human(obj: bpy.types.Object) -> bool:
    return getattr(obj, "ld_object_type") == ObjectType.HUMAN.value


def handle_autoselect_in_control_editor():
    active_obj = bpy.context.view_layer.objects.active

    if active_obj:
        if is_led_bulb(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

        if is_human(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

    # Invisible selected objects only show up in view_layer.objects.selected
    context_selected_objects: List[bpy.types.Object] = []
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        context_selected_objects.append(obj)  # type: ignore

    # Select parent if child is selected
    for obj in context_selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.HUMAN.value:
            if not obj.parent.select_get() and obj.parent != active_obj:
                obj.parent.select_set(True)
                context_selected_objects.append(obj.parent)

        else:
            ld_light_type: str = getattr(obj, "ld_light_type")
            if ld_light_type == LightType.LED_BULB.value:
                if not obj.parent.select_get() and obj.parent != active_obj:
                    obj.parent.select_set(True)
                    context_selected_objects.append(obj.parent)

    # NOTE: At this stage, MIXED_LIGHT is not necessarily mixed light, it can be LED or FIBER
    # This is used to determine objects to be selected
    if active_obj and active_obj.select_get():
        if is_dancer(active_obj):
            state.selected_obj_type = SelectedPartType.DANCER
        else:
            state.selected_obj_type = SelectedPartType.MIXED_LIGHT

    selected_base_objs: List[bpy.types.Object] = []
    selected_fiber_objs: List[bpy.types.Object] = []
    selected_led_objs: List[bpy.types.Object] = []
    selected_dancer_objs: List[bpy.types.Object] = []

    for obj in context_selected_objects:
        if is_fiber(obj) and state.selected_obj_type != SelectedPartType.DANCER:
            selected_fiber_objs.append(obj)
        elif is_led(obj) and state.selected_obj_type != SelectedPartType.DANCER:
            selected_led_objs.append(obj)
        elif is_dancer(obj) and (
            state.selected_obj_type == SelectedPartType.DANCER
            or state.selected_obj_type is None
        ):
            selected_dancer_objs.append(obj)

    # Maintain selected objects type
    if len(selected_led_objs) > 0 and len(selected_fiber_objs) > 0:
        state.selected_obj_type = SelectedPartType.MIXED_LIGHT
        selected_base_objs = [*selected_led_objs, *selected_fiber_objs]

    elif len(selected_led_objs) > 0:
        state.selected_obj_type = SelectedPartType.LED
        selected_base_objs = selected_led_objs

    elif len(selected_fiber_objs) > 0:
        state.selected_obj_type = SelectedPartType.FIBER
        selected_base_objs = selected_fiber_objs

    elif len(selected_dancer_objs) > 0:
        state.selected_obj_type = SelectedPartType.DANCER
        if len(selected_dancer_objs) > 1:
            selected_base_objs = [active_obj] if active_obj else []
        else:
            selected_base_objs = selected_dancer_objs

    else:
        state.selected_obj_type = None

    # Maintain selected object names in order
    selected_base_obj_map: Dict[str, bpy.types.Object] = {}
    for obj in selected_base_objs:
        selected_base_obj_map[obj.name] = obj

    new_selected_obj_names: List[str] = []
    for obj_name in state.selected_obj_names:
        if obj_name in selected_base_obj_map:
            new_selected_obj_names.append(obj_name)
            selected_base_obj_map.pop(obj_name)

    for obj_name in selected_base_obj_map:
        new_selected_obj_names.append(obj_name)

    # Deselect objects that are not in the new selected object names
    selected_obj_names_set = set(new_selected_obj_names)
    for obj in context_selected_objects:
        if obj.name not in selected_obj_names_set:
            obj.select_set(False)

    # Select objects in the same relation group
    for obj in selected_base_objs:
        ld_object_type: str = getattr(obj, "ld_object_type")
        ld_light_type: str = getattr(obj, "ld_light_type")

        if ld_object_type == ObjectType.LIGHT.value:
            if ld_light_type == LightType.LED.value:
                for child_obj in obj.children:
                    child_obj.select_set(True)

        elif ld_object_type == ObjectType.DANCER.value:
            for child_obj in obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

    # Activate last selected if current active object is deselected
    if (not active_obj or not active_obj.select_get()) and len(
        new_selected_obj_names
    ) > 0:
        bpy.context.view_layer.objects.active = bpy.data.objects[
            new_selected_obj_names[-1]
        ]
    if len(new_selected_obj_names) == 0:
        bpy.context.view_layer.objects.active = None  # type: ignore

    # Maintain control editor's multi-select status
    ld_ui_control_editor: ControlEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_control_editor"
    )
    ld_ui_control_editor.multi_select = (
        len(new_selected_obj_names) > 1
        and state.selected_obj_type != SelectedPartType.DANCER
    )

    sorted_selected_obj_names = sorted(state.selected_obj_names.copy())
    sorted_new_selected_obj_names = sorted(new_selected_obj_names.copy())
    if sorted_selected_obj_names != sorted_new_selected_obj_names:
        # Don't trigger update here
        ld_ui_control_editor["multi_select_color"] = -1  # type: ignore
        ld_ui_control_editor["multi_select_alpha"] = 128  # type: ignore

    state.selected_obj_names = new_selected_obj_names


def handle_autoselect_in_pos_editor():
    active_obj = bpy.context.view_layer.objects.active

    if active_obj:
        if is_led_bulb(active_obj):
            active_obj = active_obj.parent.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

        if is_light(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

        if is_human(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

    # Invisible selected objects only show up in view_layer.objects.selected
    context_selected_objects: List[bpy.types.Object] = []
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        context_selected_objects.append(obj)  # type: ignore

    # Select parent if child is selected
    for obj in context_selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.HUMAN.value and not obj.parent.select_get():
            obj.parent.select_set(True)
            context_selected_objects.append(obj.parent)

    # NOTE: At this stage, MIXED_LIGHT is not necessarily mixed light, it can be LED or FIBER
    # This is used to determine objects to be selected
    if active_obj and active_obj.select_get():
        if is_dancer(active_obj):
            state.selected_obj_type = SelectedPartType.DANCER

    # Maintain selected objects type
    selected_base_objs: List[bpy.types.Object] = []

    for obj in context_selected_objects:
        if is_dancer(obj) and (
            state.selected_obj_type == SelectedPartType.DANCER
            or state.selected_obj_type is None
        ):
            selected_base_objs.append(obj)

    if len(selected_base_objs) > 0:
        state.selected_obj_type = SelectedPartType.DANCER

    else:
        state.selected_obj_type = None

    # Maintain selected object names in order
    selected_base_obj_map: Dict[str, bpy.types.Object] = {}
    for obj in selected_base_objs:
        selected_base_obj_map[obj.name] = obj

    new_selected_obj_names: List[str] = []
    for obj_name in state.selected_obj_names:
        if obj_name in selected_base_obj_map:
            new_selected_obj_names.append(obj_name)
            selected_base_obj_map.pop(obj_name)

    for obj_name in selected_base_obj_map.keys():
        new_selected_obj_names.append(obj_name)

    # Deselect objects that are not in the new selected object names
    selected_obj_names_set = set(new_selected_obj_names)
    for obj in context_selected_objects:
        if obj.name not in selected_obj_names_set:
            obj.select_set(False)

    # Select objects in the same relation group
    for obj in selected_base_objs:
        ld_object_type: str = getattr(obj, "ld_object_type")

        if ld_object_type == ObjectType.DANCER.value:
            for child_obj in obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

    # Activate last selected if current active object is deselected
    if (not active_obj or not active_obj.select_get()) and len(
        new_selected_obj_names
    ) > 0:
        bpy.context.view_layer.objects.active = bpy.data.objects[
            new_selected_obj_names[-1]
        ]
    if len(new_selected_obj_names) == 0:
        bpy.context.view_layer.objects.active = None  # type: ignore

    # Maintain pos editor's multi-select status
    ld_ui_pos_editor: PosEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_pos_editor"
    )
    ld_ui_pos_editor.multi_select = len(new_selected_obj_names) > 1

    sorted_selected_obj_names = sorted(state.selected_obj_names.copy())
    sorted_new_selected_obj_names = sorted(new_selected_obj_names.copy())
    if sorted_selected_obj_names != sorted_new_selected_obj_names:
        # Don't trigger update here
        ld_ui_pos_editor["multi_select_delta_transform"] = (0.0, 0.0, 0.0)  # type: ignore
        ld_ui_pos_editor["multi_select_delta_transform_ref"] = (0.0, 0.0, 0.0)  # type: ignore

    state.selected_obj_names = new_selected_obj_names


def handle_autoselect_in_led_editor_edit_mode():
    # WARNING: It should by fine that we don't consider the case when objects
    # other than LED bulbs are selected in edit mode since they are filterd out
    # and that local view if toggled on (maybe we need to ban the keymap for local view)
    active_obj = bpy.context.view_layer.objects.active

    original_selected_obj_names = sorted(state.selected_obj_names.copy())

    selected_obj_names: List[str] = []
    for obj in bpy.context.selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.LIGHT.value:
            ld_light_type: str = getattr(obj, "ld_light_type")
            if ld_light_type == LightType.LED_BULB.value:
                selected_obj_names.append(obj.name)

    state.selected_obj_names = selected_obj_names

    for obj in bpy.context.selected_objects:
        if obj.name not in state.selected_obj_names:
            obj.select_set(False)

    if (active_obj and not active_obj.select_get()) and len(
        state.selected_obj_names
    ) > 0:
        bpy.context.view_layer.objects.active = bpy.data.objects[
            state.selected_obj_names[-1]
        ]
    if len(state.selected_obj_names) == 0:
        bpy.context.view_layer.objects.active = None  # type: ignore

    # TODO: maintain multi-select of led editor
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )
    ld_ui_led_editor.multi_select = len(state.selected_obj_names) > 1

    sorted_selected_obj_names = sorted(state.selected_obj_names)
    if sorted_selected_obj_names != original_selected_obj_names:
        # Don't trigger update here
        ld_ui_led_editor["multi_select_color"] = -1  # type: ignore
        ld_ui_led_editor["multi_select_alpha"] = 128  # type: ignore


def handle_autoselect_in_led_editor():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )

    if ld_ui_led_editor.edit_mode == LEDEditorEditModeType.EDIT.value:
        handle_autoselect_in_led_editor_edit_mode()
        return

    active_obj = bpy.context.view_layer.objects.active

    # NOTE: Keep selection in led editor
    if active_obj and not active_obj.select_get():
        active_obj.select_set(True)

    if active_obj:
        if is_light(active_obj) and not is_led(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

        if is_human(active_obj):
            active_obj = active_obj.parent
            active_obj.select_set(True)
            bpy.context.view_layer.objects.active = active_obj

    # Invisible selected objects only show up in view_layer.objects.selected
    context_selected_objects: List[bpy.types.Object] = []
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        context_selected_objects.append(obj)  # type: ignore

    # Select parent if child is selected
    for obj in context_selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.HUMAN.value:
            if not obj.parent.select_get():
                obj.parent.select_set(True)
                context_selected_objects.append(obj.parent)

        else:
            ld_light_type: str = getattr(obj, "ld_light_type")
            if ld_light_type == LightType.LED_BULB.value:
                if not obj.parent.select_get():
                    obj.parent.select_set(True)
                    context_selected_objects.append(obj.parent)

    # NOTE: At this stage, MIXED_LIGHT is not necessarily mixed light, it can be LED or FIBER
    # This is used to determine objects to be selected
    if active_obj and active_obj.select_get():
        if is_dancer(active_obj):
            state.selected_obj_type = SelectedPartType.DANCER
        elif is_led(active_obj):
            state.selected_obj_type = SelectedPartType.LED

    for obj in context_selected_objects:
        if obj != active_obj:
            obj.select_set(False)

    # Select objects in the same relation group
    if active_obj:
        if is_led(active_obj):
            for child_obj in active_obj.children:
                child_obj.select_set(True)

        elif is_dancer(active_obj):
            for child_obj in active_obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

    # Maintain led editor's multi-select status
    if state.selected_obj_type == SelectedPartType.LED:
        # Don't trigger update dancer here
        ld_ui_led_editor["edit_dancer"] = state.dancer_names.index(  # type: ignore
            getattr(active_obj, "ld_dancer_name")
        )
        ld_ui_led_editor.edit_part = getattr(active_obj, "ld_part_name")

    elif state.selected_obj_type == SelectedPartType.DANCER:
        ld_ui_led_editor.edit_dancer = getattr(active_obj, "ld_dancer_name")


def obj_panel_autoselect_handler(scene: bpy.types.Scene):
    """
    Auto-select a group of lights if one of each is selected.
    When a human object is selected, its dancer will also be auto-selected and vice versa.
    """
    # if bpy.context.object is None:  # type: ignore
    #     return

    match state.editor:
        case Editor.CONTROL_EDITOR:
            handle_autoselect_in_control_editor()
        case Editor.POS_EDITOR:
            handle_autoselect_in_pos_editor()
        case Editor.LED_EDITOR:
            handle_autoselect_in_led_editor()


def mount():
    bpy.app.handlers.depsgraph_update_pre.append(obj_panel_autoselect_handler)


def unmount():
    try:
        bpy.app.handlers.depsgraph_update_pre.remove(obj_panel_autoselect_handler)
    except:
        pass
