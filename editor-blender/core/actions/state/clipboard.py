import asyncio
from typing import cast

import bpy

from ....properties.types import LightType, ObjectType, PositionPropertyType
from ...models import (
    ControlMapElement,
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
from ..state.control_editor import add_control_frame, request_edit_control
from ..state.pos_editor import add_pos_frame, request_edit_pos


def copy_dancer():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    if len(state.selected_obj_names) != 1:
        return {"CANCELLED"}

    selected_obj_name = state.selected_obj_names[0]
    selected_obj = data_objects[selected_obj_name]

    ld_object_type: str = getattr(selected_obj, "ld_object_type")
    if ld_object_type != ObjectType.DANCER.value:
        return {"CANCELLED"}

    clipboard = state.clipboard
    clipboard.type = CopiedType.DANCER

    dancer_name: str = getattr(selected_obj, "ld_dancer_name")
    model_name: str = getattr(selected_obj, "ld_model_name")

    dancer_status: dict[PartName, CopiedPartData] = {}
    clipboard.dancer = CopiedDancerData(
        name=dancer_name, model=model_name, parts=dancer_status
    )

    for part_obj in selected_obj.children:
        ld_object_type: str = getattr(part_obj, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        part_name: str = getattr(part_obj, "ld_part_name")
        part_type: str = getattr(part_obj, "ld_light_type")

        if part_type == LightType.FIBER.value:
            ld_color: str = getattr(part_obj, "ld_color")
            ld_alpha: int = getattr(part_obj, "ld_alpha")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                color=ld_color,
            )

        elif part_type == LightType.LED.value:
            ld_effect: str = getattr(part_obj, "ld_effect")
            ld_alpha: int = getattr(part_obj, "ld_alpha")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                effect=ld_effect,
            )


def copy_part():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    selected_obj_dancer_names = [
        cast(str, getattr(data_objects[obj_name], "ld_dancer_name"))
        for obj_name in state.selected_obj_names
    ]

    # check if all selected objects are from the same dancer
    if selected_obj_dancer_names.count(selected_obj_dancer_names[0]) != len(
        selected_obj_dancer_names
    ):
        return {"CANCELLED"}

    dancer_name = selected_obj_dancer_names[0]
    dancer_obj = data_objects[dancer_name]
    model_name: str = getattr(dancer_obj, "ld_model_name")

    selected_obj_names = state.selected_obj_names
    selected_objs = [data_objects[obj_name] for obj_name in selected_obj_names]

    clipboard = state.clipboard
    clipboard.type = CopiedType.DANCER

    dancer_status: dict[PartName, CopiedPartData] = {}
    clipboard.dancer = CopiedDancerData(
        name=dancer_name, model=model_name, parts=dancer_status
    )

    for part_obj in selected_objs:
        ld_object_type: str = getattr(part_obj, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        part_name: str = getattr(part_obj, "ld_part_name")
        part_type: str = getattr(part_obj, "ld_light_type")

        if part_type == LightType.FIBER.value:
            ld_color: str = getattr(part_obj, "ld_color")
            ld_alpha: int = getattr(part_obj, "ld_alpha")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                color=ld_color,
            )

        elif part_type == LightType.LED.value:
            ld_effect: str = getattr(part_obj, "ld_effect")
            ld_alpha: int = getattr(part_obj, "ld_alpha")

            dancer_status[part_name] = CopiedPartData(
                alpha=ld_alpha,
                effect=ld_effect,
            )


async def paste_dancer() -> bool:
    if state.edit_state != EditMode.EDITING:
        if not (await request_edit_control()):
            return False

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    copied_dancer = state.clipboard.dancer
    if copied_dancer is None:
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

                if part_type == LightType.FIBER.value:
                    copied_color: str | None = copied_part_data.color
                    copied_alpha: int = copied_part_data.alpha

                    if copied_color is not None:
                        setattr(part_obj, "ld_color", copied_color)
                        setattr(part_obj, "ld_alpha", copied_alpha)

                elif part_type == LightType.LED.value:
                    copied_effect: str | None = copied_part_data.effect
                    copied_alpha: int = copied_part_data.alpha

                    if copied_effect is not None:
                        setattr(part_obj, "ld_effect", copied_effect)
                        setattr(part_obj, "ld_alpha", copied_alpha)

    return True


async def paste_part() -> bool:
    if state.edit_state != EditMode.EDITING:
        if not (await request_edit_control()):
            return False

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    copied_dancer = state.clipboard.dancer
    if copied_dancer is None:
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

                if part_type == LightType.FIBER.value:
                    copied_color: str | None = copied_part_data.color
                    copied_alpha: int = copied_part_data.alpha

                    if copied_color is not None:
                        setattr(part_obj, "ld_color", copied_color)
                        setattr(part_obj, "ld_alpha", copied_alpha)

                elif part_type == LightType.LED.value:
                    copied_effect: str | None = copied_part_data.effect
                    copied_alpha: int = copied_part_data.alpha

                    if copied_effect is not None:
                        setattr(part_obj, "ld_effect", copied_effect)
                        setattr(part_obj, "ld_alpha", copied_alpha)

    return True


def override_control(control_frame: ControlMapElement):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer in state.dancers_array:
        status = control_frame.status[dancer.name]
        dancer_index = state.dancer_part_index_map[dancer.name].index

        for part in dancer.parts:
            part_obj_name = f"{dancer_index}_{part.name}"
            part_obj = data_objects.get(part_obj_name)

            if part_obj is None:
                continue

            if part.type == PartType.FIBER:
                fiber_status = cast(FiberData, status[part.name])
                color = state.color_map[fiber_status.color_id]

                setattr(part_obj, "ld_color", color.name)
                setattr(part_obj, "ld_alpha", fiber_status.alpha)

            elif part.type == PartType.LED:
                led_status = cast(LEDData, status[part.name])

                effect_id = led_status.effect_id

                if effect_id == -1:
                    setattr(part_obj, "ld_effect", "no-change")
                else:
                    effect = state.led_effect_id_table[led_status.effect_id]
                    setattr(part_obj, "ld_effect", effect.name)

                setattr(part_obj, "ld_alpha", led_status.alpha)


def copy_control_frame():
    clipboard = state.clipboard
    clipboard.type = CopiedType.CONTROL_FRAME

    current_index = state.current_control_index
    current_frame_id = state.control_record[current_index]
    current_frame = state.control_map[current_frame_id]
    clipboard.control_frame = current_frame


async def paste_control_frame(add_frame: bool) -> bool:
    if not bpy.context:
        return False

    clipboard = state.clipboard

    if clipboard.control_frame is None:
        return False

    current_index = state.current_control_index
    current_frame_id = state.control_record[current_index]
    current_frame = state.control_map[current_frame_id]

    frame_current = bpy.context.scene.frame_current

    if frame_current != current_frame.start:
        if add_frame:
            await add_control_frame()

            # Wait until subscription receives the new frame
            while True:
                try:
                    next(
                        frame
                        for frame in state.control_map.values()
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
    current_frame = state.pos_map[current_frame_id]
    clipboard.pos_frame = current_frame


def override_pos(pos_frame: PosMapElement):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_name in state.dancer_names:
        location = pos_frame.pos[dancer_name]
        dancer_obj = data_objects[dancer_name]

        ld_position: PositionPropertyType = getattr(dancer_obj, "ld_position")
        ld_position.transform = (location.x, location.y, location.z)


async def paste_pos_frame(add_frame: bool) -> bool:
    if not bpy.context:
        return False

    clipboard = state.clipboard

    if clipboard.pos_frame is None:
        return False

    current_index = state.current_pos_index
    current_frame_id = state.pos_record[current_index]
    current_frame = state.pos_map[current_frame_id]

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
