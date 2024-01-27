from typing import List, Optional

import bpy

from ..core.models import Editor, SelectedPartType
from ..core.states import state
from ..properties.types import LightType, ObjectType
from ..properties.ui.types import ControlEditorStatusType

# TODO: Please make this bullshit cleaner


def handle_autoselect_in_control_editor():
    original_selected_obj_names = sorted(state.selected_obj_names.copy())

    active_obj = bpy.context.view_layer.objects.active
    select = active_obj.select_get()
    deselect = not active_obj.select_get()

    ld_object_type: str = getattr(active_obj, "ld_object_type")
    ld_light_type: str = getattr(active_obj, "ld_light_type")

    if (
        ld_object_type == ObjectType.LIGHT.value
        and ld_light_type == LightType.LED_BULB.value
    ):
        active_obj = active_obj.parent
        active_obj.select_set(True)
        bpy.context.view_layer.objects.active = active_obj

    if ld_object_type == ObjectType.HUMAN.value:
        active_obj = active_obj.parent
        active_obj.select_set(True)
        bpy.context.view_layer.objects.active = active_obj

    active_obj_type: str = getattr(active_obj, "ld_object_type")
    active_obj_name: str = active_obj.name

    select = select and active_obj_name not in state.selected_obj_names
    deselect = deselect and active_obj_name in state.selected_obj_names

    if select:
        if active_obj_type == ObjectType.LIGHT.value:
            active_light_type: str = getattr(active_obj, "ld_light_type")
            dancer_obj = active_obj.parent

            if active_light_type == LightType.FIBER.value:
                active_obj.select_set(True)

                # deselect non-light objects
                for obj in bpy.context.selected_objects:
                    ld_object_type: str = getattr(obj, "ld_object_type")
                    if ld_object_type != ObjectType.LIGHT.value:
                        obj.select_set(False)

                state.selected_obj_names.append(active_obj.name)

            elif active_light_type == LightType.LED.value:
                active_obj.select_set(True)

                # select all objects in the same group
                for obj in active_obj.children:
                    obj.select_set(True)

                # deselect non-light objects
                for obj in bpy.context.selected_objects:
                    ld_object_type: str = getattr(obj, "ld_object_type")
                    if ld_object_type != ObjectType.LIGHT.value:
                        obj.select_set(False)

                state.selected_obj_names.append(active_obj.name)

        elif active_obj_type == ObjectType.DANCER.value:
            dancer_obj = active_obj

            # deselect all other objects
            for obj in bpy.context.selected_objects:
                obj.select_set(False)

            active_obj.select_set(True)
            for child_obj in dancer_obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

            state.selected_obj_names = [active_obj_name]

    # Maintain selected object names
    selected_type_unchange = state.selected_obj_type is not None and (
        (
            state.selected_obj_type == SelectedPartType.DANCER
            and active_obj_type == ObjectType.DANCER.value
        )
        or (
            state.selected_obj_type != SelectedPartType.DANCER
            and active_obj_type != ObjectType.DANCER.value
        )
    )

    for obj in bpy.context.selected_objects:
        obj_name: str = obj.name
        ld_object_type: str = getattr(obj, "ld_object_type")

        if state.selected_obj_type == SelectedPartType.DANCER:
            # unselect lights when selecting dancers
            if ld_object_type == ObjectType.LIGHT.value and selected_type_unchange:
                obj.select_set(False)
                continue

            if (
                ld_object_type == ObjectType.DANCER.value
                and obj_name not in state.selected_obj_names
            ):
                state.selected_obj_names.append(obj_name)

        else:
            # unselect dancers when selecting lights
            if (
                ld_object_type == ObjectType.DANCER.value
                or ld_object_type == ObjectType.HUMAN.value
            ) and selected_type_unchange:
                obj.select_set(False)
                continue

            ld_light_type: str = getattr(obj, "ld_light_type")
            if ld_light_type == LightType.LED_BULB.value:
                parent_obj = obj.parent
                obj_name = parent_obj.name
                # only trigger this when not toggling selection of parent LED
                if active_obj != parent_obj:
                    parent_obj.select_set(True)

            if obj_name not in state.selected_obj_names:
                state.selected_obj_names.append(obj_name)

    # Remove deselected objects
    selected_obj_names: List[str] = []
    for obj_name in state.selected_obj_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(obj_name)
        if obj is not None:
            if obj.select_get():
                selected_obj_names.append(obj_name)

    state.selected_obj_names = selected_obj_names

    # Maintain selected object type and group selection
    num_fiber = 0
    num_led = 0
    num_dancer = 0
    for obj in bpy.context.selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.DANCER.value:
            for child_obj in obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

            num_dancer += 1

        elif ld_object_type == ObjectType.LIGHT.value:
            ld_light_type: str = getattr(obj, "ld_light_type")
            if ld_light_type == LightType.LED.value:
                for child_obj in obj.children:
                    child_obj.select_set(True)

                num_led += 1

            elif ld_light_type == LightType.LED_BULB.value:
                parent_obj = obj.parent
                obj.select_set(parent_obj.select_get())

            else:
                num_fiber += 1

        elif ld_object_type == ObjectType.HUMAN.value:
            parent_obj = obj.parent
            obj.select_set(parent_obj.select_get())

    if num_dancer > 0:
        state.selected_obj_type = SelectedPartType.DANCER
    elif num_led > 0 and num_fiber == 0:
        state.selected_obj_type = SelectedPartType.LED
    elif num_fiber > 0 and num_led == 0:
        state.selected_obj_type = SelectedPartType.FIBER
    elif num_fiber > 0 and num_led > 0:
        state.selected_obj_type = SelectedPartType.MIXED_LIGHT
    else:
        state.selected_obj_type = None

    # Active last selected object if current active object is not selected
    if not active_obj.select_get() and len(state.selected_obj_names) > 0:
        bpy.context.view_layer.objects.active = bpy.data.objects[
            state.selected_obj_names[-1]
        ]

    ld_ui_control_editor: ControlEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_control_editor"
    )
    ld_ui_control_editor.multi_select = (
        len(state.selected_obj_names) > 1
        and state.selected_obj_type != SelectedPartType.DANCER
    )

    sorted_selected_obj_names = sorted(state.selected_obj_names)
    if sorted_selected_obj_names != original_selected_obj_names:
        # Don't trigger update here
        ld_ui_control_editor["multi_select_color"] = "none"  # type: ignore
        ld_ui_control_editor["multi_select_alpha"] = 128  # type: ignore


def handle_autoselect_in_pos_editor():
    active_obj = bpy.context.view_layer.objects.active
    select = active_obj.select_get()
    deselect = not active_obj.select_get()

    ld_object_type: str = getattr(active_obj, "ld_object_type")
    ld_light_type: str = getattr(active_obj, "ld_light_type")

    if (
        ld_object_type == ObjectType.LIGHT.value
        and ld_light_type == LightType.LED_BULB.value
    ):
        active_obj.select_set(False)
        active_obj = active_obj.parent

    if ld_object_type == ObjectType.HUMAN.value:
        active_obj = active_obj.parent
        active_obj.select_set(True)
        bpy.context.view_layer.objects.active = active_obj

    active_obj_type: str = getattr(active_obj, "ld_object_type")
    active_obj_name: str = active_obj.name

    select = select and active_obj_name not in state.selected_obj_names
    deselect = deselect and active_obj_name in state.selected_obj_names

    if select:
        if active_obj_type == ObjectType.LIGHT.value:
            active_obj.select_set(False)
            dancer_obj = active_obj.parent
            dancer_obj.select_set(True)
            bpy.context.view_layer.objects.active = dancer_obj

        elif active_obj_type == ObjectType.DANCER.value:
            dancer_obj = active_obj

            # deselect all other objects
            for obj in bpy.context.selected_objects:
                ld_object_type: str = getattr(obj, "ld_object_type")
                if (
                    ld_object_type != ObjectType.DANCER.value
                    and ld_object_type != ObjectType.HUMAN.value
                ):
                    obj.select_set(False)

            active_obj.select_set(True)
            for child_obj in dancer_obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

            state.selected_obj_names.append(active_obj_name)

    # Maintain selected object names
    for obj in bpy.context.selected_objects:
        obj_name: str = obj.name
        ld_object_type: str = getattr(obj, "ld_object_type")

        # unselect lights
        if ld_object_type == ObjectType.LIGHT.value:
            obj.select_set(False)
            continue

        if (
            ld_object_type == ObjectType.DANCER.value
            and obj_name not in state.selected_obj_names
        ):
            state.selected_obj_names.append(obj_name)

    # Remove deselected objects
    selected_obj_names: List[str] = []
    for obj_name in state.selected_obj_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(obj_name)
        if obj is not None:
            if obj.select_get():
                selected_obj_names.append(obj_name)

    state.selected_obj_names = selected_obj_names

    # Maintain selected object type
    if len(state.selected_obj_names) > 0:
        state.selected_obj_type = SelectedPartType.DANCER
    else:
        state.selected_obj_type = None

    for obj in bpy.context.selected_objects:
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type == ObjectType.DANCER.value:
            for child_obj in obj.children:
                if getattr(child_obj, "ld_object_type") == ObjectType.HUMAN.value:
                    child_obj.select_set(True)

        elif ld_object_type == ObjectType.HUMAN.value:
            parent_obj = obj.parent
            obj.select_set(parent_obj.select_get())

    if not active_obj.select_get() and len(state.selected_obj_names) > 0:
        bpy.context.view_layer.objects.active = bpy.data.objects[
            state.selected_obj_names[-1]
        ]


def obj_panel_autoselect_handler(scene: bpy.types.Scene):
    """
    Auto-select a group of lights if one of each is selected.
    When a human object is selected, its dancer will also be auto-selected and vice versa.
    """
    match state.editor:
        case Editor.CONTROL_EDITOR:
            handle_autoselect_in_control_editor()
        case Editor.POS_EDITOR:
            handle_autoselect_in_pos_editor()
        case Editor.LED_EDITOR:
            pass


def mount():
    bpy.app.handlers.depsgraph_update_pre.append(obj_panel_autoselect_handler)


def unmount():
    try:
        bpy.app.handlers.depsgraph_update_pre.remove(obj_panel_autoselect_handler)
    except:
        pass
