import json
from typing import cast

import bpy

from ....api.control_agent import control_agent
from ....core.models import FiberData, LEDData
from ....properties.types import LightType
from ....schemas.mutations import (
    MutDancerFade,
    MutDancerHasEffect,
    MutDancerLEDStatusPayload,
    MutDancerStatusPayload,
)
from ...log import logger
from ...models import (
    ColorID,
    ControlMapElement_MODIFIED,
    ControlMapStatus_MODIFIED,
    DancersArrayItem,
    EditingData,
    EditMode,
    PartType,
    SelectMode,
)
from ...states import state
from ...utils.convert import control_status_state_to_mut
from ...utils.notification import notify
from ...utils.object import clear_selection
from ...utils.operator import execute_operator
from ...utils.ui import redraw_area, set_outliner_filter
from .app_state import send_request

# from .color_map import (
#     apply_color_map_updates_add_or_delete,
#     apply_color_map_updates_update,
# )
from .control_map import apply_control_map_updates
from .current_status import update_current_status_by_index

# from .led_map import apply_led_map_updates_add_or_delete, apply_led_map_updates_update


def attach_editing_control_frame():
    """Attach to editing frame and sync location to ld_position"""
    if not bpy.context:
        return
    current_frame = state.current_editing_frame

    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    bpy.context.scene.frame_set(current_frame)

    # if current_frame != bpy.context.scene.frame_current:
    #     bpy.context.scene.frame_current = current_frame

    # sync_editing_control_frame_properties()


def sync_editing_control_frame_properties():
    """Sync location to ld_position"""
    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer in state.dancers_array:
        if not show_dancer_dict[dancer.name]:
            continue
        dancer_obj: bpy.types.Object | None = bpy.data.objects.get(dancer.name)
        if dancer_obj is not None:
            part_objs: list[bpy.types.Object] = getattr(dancer_obj, "children")
            part_obj_names: list[str] = [
                getattr(obj, "ld_part_name") for obj in part_objs
            ]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]
                part_type = getattr(part_obj, "ld_light_type")

                ld_no_status: bool = getattr(part_obj, "ld_no_status")
                if ld_no_status:
                    continue
                # Re-trigger update
                if part_type == LightType.FIBER.value:
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    setattr(part_obj, "ld_alpha", ld_alpha)
                    ld_color: int = getattr(part_obj, "ld_color")
                    setattr(part_obj, "ld_color", ld_color)

                elif part_type == LightType.LED.value:
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    setattr(part_obj, "ld_alpha", ld_alpha)
                    ld_effect: int = getattr(part_obj, "ld_effect")
                    setattr(part_obj, "ld_effect", ld_effect)
                    if ld_effect == 0:
                        for bulb in part_obj.children:
                            ld_alpha: int = getattr(bulb, "ld_alpha")
                            setattr(bulb, "ld_alpha", ld_alpha)
                            ld_color: int = getattr(bulb, "ld_color")
                            setattr(bulb, "ld_color", ld_color)


async def add_control_frame():
    if not bpy.context:
        return
    start = bpy.context.scene.frame_current

    empty_status: ControlMapStatus_MODIFIED = {}
    for dancer, parts in state.dancers.items():
        empty_status[dancer] = {}
        for part in parts:
            empty_status[dancer][part] = None

    hasEffectData, fadeData, controlData, ledControlData = control_status_state_to_mut(
        empty_status
    )
    with send_request():
        try:
            await control_agent.add_frame(
                start, controlData, ledControlData, hasEffectData, fadeData
            )
            notify("INFO", "Added control frame")
        except Exception:
            logger.exception("Failed to add control frame")
            notify("WARNING", "Cannot add control frame")


def copy_ctrl_data_from_state(
    dancer: DancersArrayItem, id: int, default_color: ColorID
) -> tuple[MutDancerStatusPayload, MutDancerLEDStatusPayload]:
    partControlData: MutDancerStatusPayload = []
    partLEDControlData: MutDancerLEDStatusPayload = []

    ctrl_part_dict = state.control_map_MODIFIED[id].status[dancer.name]

    for part in dancer.parts:
        if part.name not in ctrl_part_dict.keys():
            if part.type == PartType.FIBER:
                partControlData.append((default_color, 0))
                partLEDControlData.append([])
            elif part.type == PartType.LED:
                partControlData.append((-1, 0))
                partLEDControlData.append([])
            continue

        ctrl_data = ctrl_part_dict[part.name]
        if ctrl_data is None:
            partControlData.append((-1, 0))  # Placeholder
            partLEDControlData.append([])
            continue

        if part.type == PartType.FIBER:
            part_data = cast(FiberData, ctrl_data.part_data)
            color_id = part_data.color_id
            ld_alpha = part_data.alpha
            partControlData.append((color_id, ld_alpha))
            partLEDControlData.append([])
        elif part.type == PartType.LED:
            part_data = cast(LEDData, ctrl_data.part_data)
            effect_id = part_data.effect_id
            ld_alpha = part_data.alpha
            partControlData.append((effect_id, ld_alpha))

            if effect_id == 0:
                bulb_objs_data = ctrl_data.bulb_data
                bulb_color_list: list[tuple[int, int]] = [
                    (cast(int, obj.color_id), obj.alpha) for obj in bulb_objs_data
                ]
                partLEDControlData.append(bulb_color_list)
            else:
                partLEDControlData.append([])
    return partControlData, partLEDControlData


def take_ctrl_data_from_model(
    dancer: DancersArrayItem, id: int, default_color: ColorID
) -> tuple[MutDancerStatusPayload, MutDancerLEDStatusPayload]:
    partControlData: MutDancerStatusPayload = []
    partLEDControlData: MutDancerLEDStatusPayload = []
    obj: bpy.types.Object | None = bpy.data.objects.get(dancer.name)

    if obj is not None:
        part_objs: list[bpy.types.Object] = getattr(obj, "children")
        part_obj_names: list[str] = [getattr(obj, "ld_part_name") for obj in part_objs]

        for part in dancer.parts:
            if part.name not in part_obj_names:
                if part.type == PartType.FIBER:
                    partControlData.append((default_color, 0))
                    partLEDControlData.append([])
                elif part.type == PartType.LED:
                    partControlData.append((-1, 0))
                    partLEDControlData.append([])
                continue

            part_index = part_obj_names.index(part.name)
            part_obj = part_objs[part_index]

            is_no_status = getattr(part_obj, "ld_no_status")
            if is_no_status:
                partControlData.append((-1, 0))  # Placeholder only
                partLEDControlData.append([])
                continue

            if part.type == PartType.FIBER:
                color_id = part_obj["ld_color"]
                ld_alpha: int = getattr(part_obj, "ld_alpha")
                partControlData.append((color_id, ld_alpha))
                partLEDControlData.append([])
            elif part.type == PartType.LED:
                effect_id = part_obj["ld_effect"]
                ld_alpha: int = getattr(part_obj, "ld_alpha")
                partControlData.append((effect_id, ld_alpha))
                if effect_id == 0:
                    bulb_objs: list[bpy.types.Object] = list(
                        getattr(part_obj, "children")
                    )
                    bulb_objs.sort(key=lambda _obj: getattr(_obj, "ld_led_pos"))
                    bulb_color_list: list[tuple[int, int]] = [
                        (obj["ld_color"], getattr(obj, "ld_alpha")) for obj in bulb_objs
                    ]
                    partLEDControlData.append(bulb_color_list)
                else:
                    partLEDControlData.append([])

    else:
        for part in dancer.parts:
            if part.type == PartType.FIBER:
                partControlData.append((default_color, 0))
                partLEDControlData.append([])
            elif part.type == PartType.LED:
                partControlData.append((-1, 0))
                partLEDControlData.append([])

    return partControlData, partLEDControlData


async def save_control_frame(start: int | None = None):
    if not bpy.context:
        return
    id = state.editing_data.frame_id

    # default_fade: bool = getattr(bpy.context.window_manager, "ld_default_fade")

    controlData: list[MutDancerStatusPayload] = []
    ledControlData: list[MutDancerLEDStatusPayload] = []
    hasEffectData: list[MutDancerHasEffect] = []
    fadeData: list[MutDancerFade] = []
    default_color = list(state.color_map.keys())[0]

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))

    for dancer in state.dancers_array:
        partControlData: MutDancerStatusPayload
        partLEDControlData: MutDancerLEDStatusPayload
        obj: bpy.types.Object | None = bpy.data.objects.get(dancer.name)

        if not show_dancer_dict[dancer.name]:
            # for the dancer not shown, copy their ctrl data from state.control_map
            first_part = state.control_map_MODIFIED[id].status[dancer.name][
                dancer.parts[0].name
            ]
            hasEffectData.append(first_part is not None)
            fadeData.append(False if first_part is None else first_part.fade)

            partControlData, partLEDControlData = copy_ctrl_data_from_state(
                dancer, id, default_color
            )
        else:
            part_objs: list[bpy.types.Object] = list(
                state.dancer_part_objects_map[dancer.name][1].values()
            )
            first_part_obj = part_objs[0]

            noEffectPartData = getattr(first_part_obj, "ld_no_status")
            hasEffectPartData = not noEffectPartData
            hasEffectData.append(hasEffectPartData)
            fadePartData = getattr(first_part_obj, "ld_fade")
            fadeData.append(fadePartData)

            # for the dancer shown, take their ctrl data from their model
            partControlData, partLEDControlData = take_ctrl_data_from_model(
                dancer, id, default_color
            )
        controlData.append(partControlData)
        ledControlData.append(partLEDControlData)

    with send_request():
        try:
            await control_agent.save_frame(
                id,
                controlData,
                ledControlData=ledControlData,
                fade=fadeData,
                hasEffect=hasEffectData,
                start=start,
            )
            notify("INFO", "Saved control frame")

            # Cancel editing
            ok = await control_agent.cancel_edit(id)

            if ok is not None and ok:
                state.ready_to_edit_control = False
                # Reset editing state
                state.current_editing_frame = -1
                state.current_editing_detached = False
                state.current_editing_frame_synced = False
                state.edit_state = EditMode.IDLE

                if state.local_view:
                    execute_operator("view3d.localview")
                    state.local_view = False
                set_outliner_filter("")

                # Imediately apply changes produced by editing
                apply_control_map_updates()

                redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
            else:
                notify("WARNING", "Cannot exit editing")
        except Exception:
            logger.exception("Failed to save control frame")
            notify("WARNING", "Cannot save control frame")


async def delete_control_frame():
    index = state.current_control_index
    id = state.control_record[index]

    # Get the frame data
    frame = state.control_map_MODIFIED.get(id)
    if frame is None:
        notify("WARNING", "Frame not found")
        return

    with send_request():
        try:
            await control_agent.delete_frame(id, state.show_dancers)
            notify("INFO", f"Deleted control frame: {id}")

            redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        except Exception as e:
            e_str = str(e)
            e_json = json.loads(e_str)
            if e_json["message"].startswith("The target frame is being edited by user"):
                notify("WARNING", "Delete frame rejected, for the frame is being edit")
            else:
                logger.exception("Failed to delete control frame")
                notify("WARNING", "Cannot delete position frame")


async def request_edit_control() -> bool:
    # if state.color_map_pending.add_or_delete:
    #     apply_color_map_updates_add_or_delete()
    # if state.color_map_pending.update:
    #     apply_color_map_updates_update()
    # if state.led_map_pending.add_or_delete:
    #     apply_led_map_updates_add_or_delete()
    # if state.led_map_pending.update:
    #     apply_led_map_updates_update()
    # if state.control_map_pending:
    #     apply_control_map_updates()

    index = state.current_control_index
    control_id = state.control_record[index]
    control_frame = state.control_map_MODIFIED[control_id]

    ok = None
    with send_request():
        ok = True
        try:
            ok = await control_agent.request_edit(control_id)
        except Exception as e:
            logger.exception(f"Failed to request edit control frame: {e}")

    if ok is not None and ok:
        # Init editing state
        state.current_editing_frame = control_frame.start
        state.editing_data = EditingData(
            start=state.current_editing_frame, frame_id=control_id, index=index
        )
        state.edit_state = EditMode.EDITING

        attach_editing_control_frame()
        update_current_status_by_index()

        state.ready_to_edit_control = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        return True
    else:
        notify("WARNING", "Edit request rejected")
        return False


async def cancel_edit_control():
    index = state.current_control_index
    id = state.control_record[index]

    with send_request():
        try:
            ok = await control_agent.cancel_edit(id)

            if ok is not None and ok:
                # Revert modification
                state.ready_to_edit_control = False
                update_current_status_by_index()

                # Reset editing state
                state.current_editing_frame = -1
                state.current_editing_detached = False
                state.current_editing_frame_synced = False
                state.edit_state = EditMode.IDLE

                if state.local_view:
                    execute_operator("view3d.localview")
                    state.local_view = False
                set_outliner_filter("")

                redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
            else:
                notify("WARNING", "Cannot cancel edit")

        except Exception:
            logger.exception("Failed to cancel edit control frame")
            notify("WARNING", "Cannot cancel edit")


def toggle_dancer_mode():
    bpy.context.view_layer.objects.active = None  # type: ignore
    state.selected_obj_type = None
    clear_selection()
    state.selection_mode = SelectMode.DANCER_MODE
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def toggle_part_mode():
    bpy.context.view_layer.objects.active = None  # type: ignore
    state.selected_obj_type = None
    clear_selection()
    state.selection_mode = SelectMode.PART_MODE
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def toggle_led_focus(obj: bpy.types.Object):
    toggle_part_mode()
    if not state.local_view:
        bpy.ops.object.select_all(action="DESELECT")
        for bulb in obj.children:
            bulb.select_set(True)
        execute_operator("view3d.localview")
        set_outliner_filter(obj.name + ".")
        state.local_view = True
    else:
        bpy.ops.object.select_all(action="DESELECT")
        execute_operator("view3d.localview")
        set_outliner_filter("")
        state.local_view = False
