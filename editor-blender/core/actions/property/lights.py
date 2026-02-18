from typing import assert_never, cast

import bpy

from ....properties.types import LightType
from ...log import logger
from ...models import RGB, ColorID, CtrlData, EditMode, FiberData, LEDData, PartType
from ...states import state
from ...utils.convert import gradient_to_rgb_float, rgba_to_float

"""
Controlling temporary object color in Blender using lightdance props as edit preview.

`ld_color`: Color ID
`ld_alpha`: Alpha value (0-255) == Brightness != Blender object alpha.

`ld_color` + `ld_alpha` => `ld_color_float` (<- This step is done by `update_current_color`)
`ld_color_float` (+ parent `ld_alpha`) => Blender object color

Fiber: Use `ld_color` and `ld_alpha` to determine blender object color.
LED:
- Effect != 0 (Effect mode)
  - Use effect to determine `ld_color` (on bulb) and `ld_alpha` (parent).
  - Bulb color is determined by `ld_color` (on bulb) and `ld_alpha` (on bulb and parent).
  - Effect == -1: Use previous effect ("no effect").
- Effect == 0 (Single bulb mode)
  - Use `ld_color` and `ld_alpha` (both on bulb) to determine blender object color.
  - If `ld_color` == -1, interpolate gradient between adjacent bulbs.
    - Colors are determined by `ld_color_float`.
    - If both ends are -1, fill with black.
"""


def update_current_color(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    if ld_light_type != LightType.LED_BULB.value and ld_no_status:
        setattr(self, "ld_no_status", False)

    ld_alpha: int = getattr(self, "ld_alpha")

    if (ld_light_type := getattr(self, "ld_light_type")) == LightType.LED.value:
        return
    if ld_light_type == LightType.LED_BULB.value:
        if self.parent and self.parent["ld_effect"] == 0:
            update_gradient_color(self.parent)
            return
    if "ld_color" not in self:
        # NOTE: Effect is usually updated before bulb color.
        return
    color_id: int = self["ld_color"]
    if color_id == -1 and self.parent:
        # NOTE: Effect is usually updated before bulb color.
        return
    color = state.color_map[color_id]
    color_float = rgba_to_float(color.rgb, ld_alpha)

    setattr(self, "ld_color_float", color_float[:3])

    self.color = (*color_float, 1.0)


def update_current_effect(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    if ld_light_type != LightType.LED_BULB.value and ld_no_status:
        setattr(self, "ld_no_status", False)

    effect_id: int = self["ld_effect"]
    effect = None
    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    ld_part_name: str = getattr(self, "ld_part_name")

    if effect_id == -1:
        control_index = state.editing_data.index

        # Find previous effect
        while control_index > 0:
            prev_control_id = state.control_record[control_index - 1]
            prev_control_map = state.control_map_MODIFIED[prev_control_id]

            ld_dancer_name: str = getattr(self, "ld_dancer_name")
            prev_dancer_status = prev_control_map.status[ld_dancer_name]

            ld_part_name: str = getattr(self, "ld_part_name")
            prev_part_status = prev_dancer_status[ld_part_name]

            if prev_part_status is None:
                continue
            print(prev_part_status)
            if not isinstance(prev_part_status, LEDData):
                raise Exception("LEDData expected")

            if prev_part_status.effect_id != -1:
                effect_id = prev_part_status.effect_id
                break

            control_index -= 1
            print(control_index)

        if effect_id == -1:
            return

    if effect_id == 0:
        return
    else:
        effect = state.led_effect_id_table[effect_id]

        bulb_data = effect.effect

    led_bulb_objs: list[bpy.types.Object] = getattr(self, "children")

    for led_bulb_obj in led_bulb_objs:
        pos: int = getattr(led_bulb_obj, "ld_led_pos")
        data = bulb_data[pos]

        color = state.color_map[data.color_id]
        setattr(led_bulb_obj, "ld_color", color.name)
        setattr(led_bulb_obj, "ld_alpha", data.alpha)

    update_current_alpha(self, context)


def update_current_alpha(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    if ld_light_type != LightType.LED_BULB.value and ld_no_status:
        setattr(self, "ld_no_status", False)

    ld_alpha: int = getattr(self, "ld_alpha")

    if ld_light_type == LightType.LED.value and self["ld_effect"] != 0:
        led_bulb_objs: list[bpy.types.Object] = getattr(self, "children")
        for (
            led_bulb_obj
        ) in led_bulb_objs:  # Stacking ld_alpha's effect of LED and LED_BULB
            update_current_color(led_bulb_obj, context)
            bulb_ld_color_float: list[float] = getattr(led_bulb_obj, "ld_color_float")
            led_bulb_obj.color[0] = bulb_ld_color_float[0] * (ld_alpha / 255)
            led_bulb_obj.color[1] = bulb_ld_color_float[1] * (ld_alpha / 255)
            led_bulb_obj.color[2] = bulb_ld_color_float[2] * (ld_alpha / 255)
    elif ld_light_type == LightType.FIBER.value:  # Let update_current_color handle it
        update_current_color(self, context)
    elif (
        ld_light_type == LightType.LED_BULB.value
    ):  # Let update_gradient_color handle it
        if self.parent and self.parent["ld_effect"] == 0:
            update_gradient_color(self.parent)


def update_gradient_color(led_obj: bpy.types.Object):
    for led_bulb_obj in led_obj.children:
        if "ld_color" not in led_bulb_obj:
            led_bulb_obj["ld_color"] = -1
        if "ld_alpha" not in led_bulb_obj:
            setattr(led_bulb_obj, "ld_alpha", 255)

    led_status: list[tuple[ColorID, int]] = [
        (
            led_bulb_obj["ld_color"],
            led_bulb_obj["ld_alpha"],
        )
        for led_bulb_obj in led_obj.children
    ]

    rgb_float_list: list[tuple[float, ...]] = gradient_to_rgb_float(led_status)

    for index, (led_bulb_obj, rgb_float) in enumerate(
        zip(led_obj.children, rgb_float_list)
    ):
        led_bulb_obj.color = (*rgb_float, 1.0)
        setattr(led_bulb_obj, "ld_color_float", rgb_float)


def _default_float(ld_part_name):
    part_type = state.part_type_map[ld_part_name]
    match part_type:
        case PartType.FIBER:
            color_float = (0.0, 0.0, 0.0)
        case PartType.LED:
            part_length = state.led_part_length_map[ld_part_name]
            color_float = [(0.0, 0.0, 0.0)] * part_length
    return color_float


def _get_prev_ctrl_data(control_index: int, ld_dancer_name: str, ld_part_name: str):
    prev_control_index = control_index - 1
    prev_color_float, prev_fade, prev_start = None, False, None
    prev_ctrl_data = None
    prev_data_is_no_change = False

    while prev_control_index >= 0:
        prev_ctrl_data = state.control_map_MODIFIED[prev_control_index].status[
            ld_dancer_name
        ][ld_part_name]
        if prev_ctrl_data is None:
            prev_control_index -= 1
            continue
        if isinstance(prev_ctrl_data, LEDData) and prev_ctrl_data.effect_id == -1:
            if not prev_data_is_no_change:
                prev_data_is_no_change = True
                prev_start = state.control_start_record[prev_control_index]
                prev_fade = prev_ctrl_data.fade
            prev_control_index -= 1
            continue
        break

    if prev_control_index == -1:
        if prev_data_is_no_change:
            prev_color_float = _default_float(ld_part_name)
        else:
            prev_color_float = None
    else:
        prev_ctrl_data = cast(CtrlData, prev_ctrl_data)
        prev_start = state.control_start_record[prev_control_index]
        prev_color_float = _ctrl_data_to_float(prev_ctrl_data)
        if not prev_data_is_no_change:
            prev_fade = prev_ctrl_data.fade

    return prev_color_float, prev_fade, prev_start


def _get_next_ctrl_data(
    control_index, ld_dancer_name, ld_part_name, prev_color_float
) -> tuple[tuple[float, float, float] | list[tuple[float, float, float]], int | None]:
    next_control_index = control_index + 1
    next_color_float, next_start = None, None
    next_ctrl_data = None
    next_data_is_no_change = False

    while next_control_index <= len(state.control_record) - 1:
        next_ctrl_data = state.control_map_MODIFIED[next_control_index].status[
            ld_dancer_name
        ][ld_part_name]
        if next_ctrl_data is None:
            next_control_index += 1
            continue
        if isinstance(next_ctrl_data, LEDData) and next_ctrl_data.effect_id == -1:
            if not next_data_is_no_change:
                next_data_is_no_change = True
                next_start = state.control_start_record[next_control_index]
        break

    if next_control_index == len(state.control_record):
        next_color_float = None
    else:
        next_ctrl_data = cast(CtrlData, next_ctrl_data)
        next_start = state.control_start_record[next_control_index]

        if next_data_is_no_change:
            if prev_color_float is None:
                next_color_float = _default_float(ld_part_name)
            else:
                next_color_float = prev_color_float
        else:
            next_color_float = _ctrl_data_to_float(next_ctrl_data)

    return next_color_float, next_start  # type: ignore


def _ctrl_data_to_float(ctrl_data: CtrlData):
    part_data = ctrl_data.part_data
    if isinstance(part_data, FiberData):
        color_id, color_alpha = part_data.color_id, part_data.alpha
        color = state.color_map[color_id]
        color_float = rgba_to_float(color.rgb, color_alpha)
        return cast(tuple[float, float, float], color_float)
    elif isinstance(part_data, LEDData):
        effect_id, effect_alpha = part_data.effect_id, part_data.alpha
        bulb_floats = []

        if effect_id == 0:
            # Effect is bulb color
            bulb_orig_list = ctrl_data.bulb_data
            bulb_list = [(bulb.color_id, bulb.alpha) for bulb in bulb_orig_list]
            bulb_floats = gradient_to_rgb_float(bulb_list)
        else:
            # If effect is not bulb color, handle effect alpha
            # Effect id may not be -1 (This case in handled before this function)
            effect = state.led_effect_id_table[effect_id]
            bulb_list = [(bulb.color_id, bulb.alpha) for bulb in effect.effect]
            bulb_prealpha_floats = gradient_to_rgb_float(bulb_list)

            bulb_floats = [
                tuple(
                    map(
                        lambda prim_color: prim_color * effect_alpha / 255.0, bulb_float
                    )
                )
                for bulb_float in bulb_prealpha_floats
            ]
        bulb_floats = cast(list[tuple[float, float, float]], bulb_floats)
        return bulb_floats
    else:
        assert_never(part_data)


def _interpolate_floats(prev_color_float, next_color_float, starts):
    prev_start, current_start, next_start = starts
    left_weight = (next_start - current_start) / (next_start - prev_start)
    right_weight = (current_start - prev_start) / (next_start - prev_start)

    if isinstance(prev_color_float, tuple):
        prev_color_float = cast(tuple[float, float, float], prev_color_float)
        next_color_float = cast(tuple[float, float, float], next_color_float)

        color_zips = zip(prev_color_float, next_color_float)
        interpolate_color = tuple(
            map(
                lambda color_zip: color_zip[0] * left_weight
                + color_zip[1] * right_weight,
                color_zips,
            )
        )
        return cast(tuple[float, float, float], interpolate_color)
    else:
        prev_color_float = cast(list[tuple[float, float, float]], prev_color_float)
        next_color_float = cast(list[tuple[float, float, float]], next_color_float)
        interpolate_colors: list[tuple[float, float, float]] = []
        for i in range(len(prev_color_float)):
            prev_bulb_float, next_bulb_float = prev_color_float[i], next_color_float[i]
            bulb_zips = zip(prev_bulb_float, next_bulb_float)
            interpolate_bulb = tuple(
                map(
                    lambda color_zip: color_zip[0] * left_weight
                    + color_zip[1] * right_weight,
                    bulb_zips,
                )
            )
            interpolate_bulb = cast(tuple[float, float, float], interpolate_bulb)
            interpolate_colors.append(interpolate_bulb)
        return interpolate_colors


def _set_current_floats(
    self: bpy.types.Object,
    color_float: tuple[float, float, float] | list[tuple[float, float, float]],
):
    if isinstance(color_float, tuple):
        color_float = cast(tuple[float, float, float], color_float)

        setattr(self, "ld_color_float", color_float)
        self.color = (*color_float, 1.0)
    else:
        color_floats = cast(list[tuple[float, float, float]], color_float)
        led_bulb_objs: list[bpy.types.Object] = getattr(self, "children")
        color_bulb_zips = zip(color_floats, led_bulb_objs)
        for color_float, led_bulb_obj in color_bulb_zips:
            setattr(led_bulb_obj, "ld_color_float", color_float)
            led_bulb_obj.color = (*color_float, 1.0)


def update_current_is_no_effect(self: bpy.types.Object, context: bpy.types.Context):
    if not bpy.context:
        return

    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_has_status: bool = not getattr(self, "ld_no_status")
    if ld_has_status:
        ld_allow_override = getattr(self, "ld_allow_override_from_prev")
        if not ld_allow_override:
            return

        default_fade: bool = getattr(bpy.context.window_manager, "ld_default_fade")
        setattr(self, "ld_fade", default_fade)

        prev_alpha = getattr(self, "ld_prev_alpha")
        setattr(self, "ld_alpha", prev_alpha)

        ld_light_type = getattr(self, "ld_light_type")
        if ld_light_type == LightType.FIBER.value:
            prev_color = getattr(self, "ld_prev_color")
            setattr(self, "ld_color", prev_color)
        elif ld_light_type == LightType.LED.value:
            prev_effect = getattr(self, "ld_prev_effect")
            setattr(self, "ld_effect", prev_effect)

        setattr(self, "ld_allow_override_from_prev", False)
        return

    setattr(self, "ld_allow_override_from_prev", True)

    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    ld_part_name: str = getattr(self, "ld_part_name")

    control_index = state.editing_data.index
    current_start = state.control_start_record[control_index]

    (prev_color_float, prev_fade, prev_start) = _get_prev_ctrl_data(
        control_index, ld_dancer_name, ld_part_name
    )
    if prev_color_float is not None and not prev_fade:
        _set_current_floats(self, prev_color_float)
        return

    (next_color_float, next_start) = _get_next_ctrl_data(
        control_index, ld_dancer_name, ld_part_name, prev_color_float
    )
    if next_color_float is None:
        if prev_color_float is None:
            _set_current_floats(self, _default_float(ld_part_name))
        else:
            _set_current_floats(self, prev_color_float)
    elif prev_color_float is None:
        _set_current_floats(self, next_color_float)
    else:
        starts = prev_start, current_start, next_start
        interpolated_float = _interpolate_floats(
            prev_color_float, next_color_float, starts
        )
        _set_current_floats(self, interpolated_float)
