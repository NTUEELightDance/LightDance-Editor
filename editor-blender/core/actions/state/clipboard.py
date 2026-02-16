import asyncio
from typing import cast

import bpy

from ....core.actions.state.current_pos import _interpolate_dancer_position
from ....properties.types import LightType, ObjectType, PositionPropertyType
from ...models import (
    ControlMapElement_MODIFIED,
    CopiedDancerData,
    CopiedPartData,
    CopiedType,
    EditMode,
    FiberData,
    LEDData,
    PartName,
    PartType,
    PosMapElement,
)
from ...states import state
from ...utils.algorithms import binary_search
from ...utils.notification import notify
from ..state.control_editor import add_control_frame, request_edit_control
from ..state.pos_editor import add_pos_frame, request_edit_pos


def copy_dancer():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    if len(state.selected_obj_names) != 1:
        notify("WARNING", "You can only copy one dancer at a time")
        return

    selected_obj_name = state.selected_obj_names[0]
    selected_obj = data_objects[selected_obj_name]

    ld_object_type: str = getattr(selected_obj, "ld_object_type")
    if ld_object_type != ObjectType.DANCER.value:
        return

    clipboard = state.clipboard
    clipboard.type = CopiedType.DANCER

    dancer_name: str = getattr(selected_obj, "ld_dancer_name")
    model_name: str = getattr(selected_obj, "ld_model_name")

    dancer_status: dict[PartName, CopiedPartData | None] = {}
    clipboard.dancer = CopiedDancerData(
        name=dancer_name, model=model_name, parts=dancer_status
    )

    for part_obj in selected_obj.children:
        ld_object_type: str = getattr(part_obj, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        part_name: str = getattr(part_obj, "ld_part_name")
        part_type: str = getattr(part_obj, "ld_light_type")

        # TODO: implement this
        ld_no_status: bool = getattr(part_obj, "ld_no_status")
        if ld_no_status:
            dancer_status[part_name] = None
        elif part_type == LightType.FIBER.value:
            ld_color: str = getattr(part_obj, "ld_color")
            ld_alpha: int = getattr(part_obj, "ld_alpha")
            ld_fade: bool = getattr(part_obj, "ld_fade")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                color=ld_color,
                fade=ld_fade,
            )

        elif part_type == LightType.LED.value:
            ld_effect: str = getattr(part_obj, "ld_effect")
            ld_alpha: int = getattr(part_obj, "ld_alpha")
            ld_fade: bool = getattr(part_obj, "ld_fade")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                effect=ld_effect,
                led_status=(
                    None
                    if ld_effect != "[Bulb Color]"
                    else [
                        (
                            getattr(led_bulb_obj, "ld_color"),
                            getattr(led_bulb_obj, "ld_alpha"),
                        )
                        for led_bulb_obj in part_obj.children
                    ]
                ),
                fade=ld_fade,
            )
    notify("INFO", "Copied")


def copy_part():
    """Copy the selected part(s) to the clipboard. Note that all selected parts must be from the same dancer."""
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    selected_obj_dancer_names = [
        cast(str, getattr(data_objects[obj_name], "ld_dancer_name"))
        for obj_name in state.selected_obj_names
    ]

    # check if all selected objects are from the same dancer
    if selected_obj_dancer_names.count(selected_obj_dancer_names[0]) != len(
        selected_obj_dancer_names
    ):
        notify("WARNING", "All copied parts must be from the same dancer")
        return {"CANCELLED"}

    if len(selected_obj_dancer_names) == 0:
        return {"CANCELLED"}

    dancer_name = selected_obj_dancer_names[0]
    dancer_obj = data_objects[dancer_name]
    model_name: str = getattr(dancer_obj, "ld_model_name")

    selected_obj_names = state.selected_obj_names
    selected_objs = [data_objects[obj_name] for obj_name in selected_obj_names]

    clipboard = state.clipboard
    clipboard.type = CopiedType.DANCER

    dancer_status: dict[PartName, CopiedPartData | None] = {}
    clipboard.dancer = CopiedDancerData(
        name=dancer_name, model=model_name, parts=dancer_status
    )

    for part_obj in selected_objs:
        ld_object_type: str = getattr(part_obj, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        part_name: str = getattr(part_obj, "ld_part_name")
        part_type: str = getattr(part_obj, "ld_light_type")

        ld_no_status: bool = getattr(part_obj, "ld_no_status")
        if ld_no_status:
            dancer_status[part_name] = None
        elif part_type == LightType.FIBER.value:
            ld_color: str = getattr(part_obj, "ld_color")
            ld_alpha: int = getattr(part_obj, "ld_alpha")
            ld_fade: bool = getattr(part_obj, "ld_fade")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                color=ld_color,
                fade=ld_fade,
            )

        elif part_type == LightType.LED.value:
            ld_effect: str = getattr(part_obj, "ld_effect")
            ld_alpha: int = getattr(part_obj, "ld_alpha")
            ld_fade: bool = getattr(part_obj, "ld_fade")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                effect=ld_effect,
                led_status=(
                    None
                    if ld_effect != "[Bulb Color]"
                    else [
                        (
                            getattr(led_bulb_obj, "ld_color"),
                            getattr(led_bulb_obj, "ld_alpha"),
                        )
                        for led_bulb_obj in part_obj.children
                    ]
                ),
                fade=ld_fade,
            )
    notify("INFO", "Copied")


async def paste_dancer() -> bool:
    if state.edit_state != EditMode.EDITING:
        if not (await request_edit_control()):
            return False

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    copied_dancer = state.clipboard.dancer
    if copied_dancer is None:
        notify("WARNING", "No dancer copied")
        return False

    for dancer_obj_name in state.selected_obj_names:
        dancer_obj = data_objects[dancer_obj_name]

        ld_object_type: str = getattr(dancer_obj, "ld_object_type")
        if ld_object_type != ObjectType.DANCER.value:
            return False

        # dancer_name: str = getattr(selected_obj, "ld_dancer_name")
        # model_name: str = getattr(selected_obj, "ld_model_name")

        for part_obj in dancer_obj.children:
            ld_object_type: str = getattr(part_obj, "ld_object_type")
            if ld_object_type != ObjectType.LIGHT.value:
                continue

            part_name: str = getattr(part_obj, "ld_part_name")
            part_type: str = getattr(part_obj, "ld_light_type")

            if part_name in copied_dancer.parts:
                copied_part_data = copied_dancer.parts[part_name]

                if copied_part_data is None:
                    setattr(part_obj, "ld_no_status", True)
                    continue

                setattr(part_obj, "ld_no_status", False)
                if part_type == LightType.FIBER.value:
                    copied_color: str | None = copied_part_data.color
                    copied_alpha: int = copied_part_data.alpha
                    copied_fade: bool = copied_part_data.fade

                    if copied_color is not None:
                        setattr(part_obj, "ld_color", copied_color)
                        setattr(part_obj, "ld_alpha", copied_alpha)
                        setattr(part_obj, "ld_fade", copied_fade)

                elif part_type == LightType.LED.value:
                    copied_effect: str | None = copied_part_data.effect
                    copied_alpha: int = copied_part_data.alpha
                    copied_fade: bool = copied_part_data.fade

                    if copied_effect is not None:
                        setattr(part_obj, "ld_effect", copied_effect)
                        setattr(part_obj, "ld_alpha", copied_alpha)
                        setattr(part_obj, "ld_fade", copied_fade)

                        if copied_effect == "[Bulb Color]":
                            copied_led_status = copied_part_data.led_status
                            if copied_led_status is not None:
                                for led_bulb_obj, (color, alpha) in zip(
                                    part_obj.children, copied_led_status
                                ):
                                    setattr(led_bulb_obj, "ld_color", color)
                                    setattr(led_bulb_obj, "ld_alpha", alpha)
    notify("INFO", "Pasted")
    return True


async def paste_part() -> bool:
    if state.edit_state != EditMode.EDITING:
        if not (await request_edit_control()):
            notify("WARNING", "Failed to request edit control")
            return False

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    copied_dancer = state.clipboard.dancer
    if copied_dancer is None:
        notify("WARNING", "No dancer copied")
        return False

    selected_dancer_objs: dict[str, list[bpy.types.Object]] = {}
    for obj_name in state.selected_obj_names:
        obj = data_objects[obj_name]
        dancer_name: str = getattr(obj, "ld_dancer_name")

        if dancer_name not in selected_dancer_objs:
            selected_dancer_objs[dancer_name] = []

        selected_dancer_objs[dancer_name].append(obj)

    for dancer_name, dancer_part_objs in selected_dancer_objs.items():
        dancer_obj = data_objects[dancer_name]

        ld_object_type: str = getattr(dancer_obj, "ld_object_type")
        if ld_object_type != ObjectType.DANCER.value:
            return False

        for part_obj in dancer_part_objs:
            ld_object_type: str = getattr(part_obj, "ld_object_type")
            if ld_object_type != ObjectType.LIGHT.value:
                continue

            part_name: str = getattr(part_obj, "ld_part_name")
            part_type: str = getattr(part_obj, "ld_light_type")

            if part_name in copied_dancer.parts:
                copied_part_data = copied_dancer.parts[part_name]

                if copied_part_data is None:
                    setattr(part_obj, "ld_no_status", True)
                    continue
                setattr(part_obj, "ld_no_status", False)

                if part_type == LightType.FIBER.value:
                    copied_color: str | None = copied_part_data.color
                    copied_alpha: int = copied_part_data.alpha
                    copied_fade: bool = copied_part_data.fade

                    if copied_color is not None:
                        setattr(part_obj, "ld_color", copied_color)
                        setattr(part_obj, "ld_alpha", copied_alpha)
                        setattr(part_obj, "ld_fade", copied_fade)

                elif part_type == LightType.LED.value:
                    copied_effect: str | None = copied_part_data.effect
                    copied_alpha: int = copied_part_data.alpha
                    copied_fade: bool = copied_part_data.fade

                    if copied_effect is not None:
                        setattr(part_obj, "ld_effect", copied_effect)
                        setattr(part_obj, "ld_alpha", copied_alpha)
                        setattr(part_obj, "ld_fade", copied_fade)

                        if copied_effect == "[Bulb Color]":
                            copied_led_status = copied_part_data.led_status
                            if copied_led_status is not None:
                                for led_bulb_obj, (color, alpha) in zip(
                                    part_obj.children, copied_led_status
                                ):
                                    setattr(led_bulb_obj, "ld_color", color)
                                    setattr(led_bulb_obj, "ld_alpha", alpha)
    notify("INFO", "Pasted")
    return True


def override_control(control_frame: ControlMapElement_MODIFIED):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer in state.dancers_array:
        if not show_dancer_dict[dancer.name]:
            continue

        status = control_frame.status[dancer.name]
        # led_status = control_frame.led_status[dancer.name]
        dancer_index = state.dancer_part_index_map[dancer.name].index

        for part in dancer.parts:
            part_obj_name = f"{dancer_index}_{part.name}"
            part_obj = data_objects.get(part_obj_name)

            if part_obj is None:
                continue

            part_ctrl_data = status[part.name]
            if part_ctrl_data is None:
                setattr(part_obj, "ld_no_status", True)
                continue

            setattr(part_obj, "ld_no_status", False)
            if part.type == PartType.FIBER:
                fiber_status = cast(FiberData, part_ctrl_data.part_data)
                color = state.color_map[fiber_status.color_id]

                setattr(part_obj, "ld_color", color.name)
                setattr(part_obj, "ld_alpha", fiber_status.alpha)
                setattr(part_obj, "ld_fade", part_ctrl_data.fade)

            elif part.type == PartType.LED:
                led_effect = cast(LEDData, part_ctrl_data.part_data)

                effect_id = led_effect.effect_id

                if effect_id == -1:
                    setattr(part_obj, "ld_effect", "no-change")
                elif effect_id == 0:
                    part_led_status = part_ctrl_data.bulb_data
                    setattr(part_obj, "ld_effect", "[Bulb Color]")
                    # if part_led_status is not None:
                    if part_led_status:
                        for led_bulb_obj, led_bulb_status in zip(
                            part_obj.children, part_led_status
                        ):
                            color = (
                                state.color_map[led_bulb_status.color_id]
                                if led_bulb_status.color_id != -1
                                else "[gradient]"
                            )
                            setattr(led_bulb_obj, "ld_color", color)
                            setattr(led_bulb_obj, "ld_alpha", led_bulb_status.alpha)
                else:
                    effect = state.led_effect_id_table[led_effect.effect_id]
                    setattr(part_obj, "ld_effect", effect.name)

                setattr(part_obj, "ld_alpha", led_effect.alpha)
                setattr(part_obj, "ld_fade", part_ctrl_data.fade)


def copy_control_frame():
    clipboard = state.clipboard
    clipboard.type = CopiedType.CONTROL_FRAME

    current_index = state.current_control_index
    current_frame_id = state.control_record[current_index]
    current_frame = state.control_map_MODIFIED[current_frame_id]
    clipboard.control_frame = current_frame


# FIXME: check if this is correct
async def paste_control_frame(add_frame: bool) -> bool:
    if not bpy.context:
        return False

    clipboard = state.clipboard

    if clipboard.control_frame is None:
        return False

    current_index = state.current_control_index
    current_frame_id = state.control_record[current_index]
    current_frame = state.control_map_MODIFIED[current_frame_id]

    frame_current = bpy.context.scene.frame_current

    if frame_current != current_frame.start:
        if add_frame:
            await add_control_frame()

            # Wait until subscription receives the new frame
            while True:
                try:
                    next(
                        frame
                        for frame in state.control_map_MODIFIED.values()
                        if frame.start == frame_current
                    )
                    break

                except StopIteration:
                    await asyncio.sleep(0.1)
                    continue

            await request_edit_control()
            override_control(clipboard.control_frame)

        else:
            bpy.context.scene.frame_current = current_frame.start
            await request_edit_control()
            override_control(clipboard.control_frame)

    else:
        await request_edit_control()
        override_control(clipboard.control_frame)

    return True


def copy_pos_frame():
    clipboard = state.clipboard
    clipboard.type = CopiedType.POS_FRAME

    current_index = state.current_pos_index
    current_frame_id = state.pos_record[current_index]
    current_frame = state.pos_map_MODIFIED[current_frame_id]
    clipboard.pos_frame = current_frame


def override_pos(pos_frame: PosMapElement):
    if not bpy.context:
        return

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer_name in state.dancer_names:
        if not show_dancer_dict[dancer_name]:
            continue
        dancer_obj = data_objects[dancer_name]

        pos_data = pos_frame.pos[dancer_name]
        if pos_data is None:
            frame = bpy.context.scene.frame_current
            index = state.current_pos_index
            ld_position: PositionPropertyType = getattr(dancer_obj, "ld_position")
            ld_position.is_none = True
            position = _interpolate_dancer_position(dancer_name, frame, index)
            ld_position.location, ld_position.rotation = (
                ((0, 0, 0), (0, 0, 0)) if position is None else position
            )
            continue

        setattr(dancer_obj, "ld_has_effect", True)
        location = pos_data.location
        rotation = pos_data.rotation

        ld_position: PositionPropertyType = getattr(dancer_obj, "ld_position")
        ld_position.location = (location.x, location.y, location.z)
        ld_position.rotation = (rotation.rx, rotation.ry, rotation.rz)


async def paste_pos_frame(add_frame: bool) -> bool:
    if not bpy.context:
        return False

    clipboard = state.clipboard

    if clipboard.pos_frame is None:
        return False

    current_index = state.current_pos_index
    current_frame_id = state.pos_record[current_index]
    current_frame = state.pos_map_MODIFIED[current_frame_id]

    frame_current = bpy.context.scene.frame_current

    if frame_current != current_frame.start:
        if add_frame:
            await add_pos_frame()

            # Wait until subscription receives the new frame
            while True:
                try:
                    next(
                        frame
                        for frame in state.pos_map.values()
                        if frame.start == frame_current
                    )
                    break

                except StopIteration:
                    await asyncio.sleep(0.1)
                    continue

            await request_edit_pos()
            override_pos(clipboard.pos_frame)

        else:
            bpy.context.scene.frame_current = current_frame.start
            await request_edit_pos()
            override_pos(clipboard.pos_frame)

    else:
        await request_edit_pos()
        override_pos(clipboard.pos_frame)

    return True
