from typing import assert_never, cast

import bpy

from ....core.actions.property.animation_data.utils import (
    ensure_action,
    ensure_curve,
    get_curve,
    get_keyframe_points,
)
from ....properties.types import LightType, ObjectType
from ...log import logger
from ...models import RGB, ColorID, CtrlData, EditMode, FiberData, LEDData, PartType
from ...states import state
from ...utils.algorithms import binary_search
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
    # print(self["ld_color"], "color")

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    if ld_no_status:
        return

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
    # print(self["ld_effect"], "effect")

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    if ld_no_status:
        return

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
            prev_ctrl_status = prev_dancer_status[ld_part_name]
            if prev_ctrl_status is None:
                control_index -= 1
                continue

            prev_part_status = prev_ctrl_status.part_data
            if not isinstance(prev_part_status, LEDData):
                raise Exception(f"LEDData Expected.")

            if prev_part_status.effect_id != -1:
                effect_id = prev_part_status.effect_id
                break

            control_index -= 1

        if effect_id == -1:
            setattr(self, "ld_alpha", 1)
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
    # print(self["ld_alpha"], "alpha")

    ld_light_type = getattr(self, "ld_light_type")
    ld_no_status = getattr(self, "ld_no_status")
    ld_alpha: int = getattr(self, "ld_alpha")
    if ld_no_status:
        return

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


def _interpolate_float(prev_float, next_float, starts):
    prev_start, current_start, next_start = starts
    left_weight = (next_start - current_start) / (next_start - prev_start)
    right_weight = (current_start - prev_start) / (next_start - prev_start)

    return prev_float * left_weight + next_float * right_weight


def _prim_color_interpolation(curve):
    keyframe_point = get_keyframe_points(curve)[1]
    co_first_lists = [keyframe.co[0] for keyframe in keyframe_point]
    current_frame = state.current_editing_frame
    index = binary_search(co_first_lists, current_frame)

    left_start, left_value = None, 0
    left_fade = False
    if index != -1:
        left_start, left_value = keyframe_point[index].co
        left_fade = keyframe_point[index].interpolation == "LINEAR"
        if co_first_lists[index] == current_frame:
            if index == 0:
                left_start, left_value = None, 0
            else:
                left_start, left_value = keyframe_point[index - 1].co
                left_fade = keyframe_point[index - 1].interpolation == "LINEAR"

    right_start, right_value = None, 0
    if index < len(keyframe_point) - 1:
        right_start, right_value = keyframe_point[index + 1].co

    if left_start is not None and not left_fade:
        return left_value
    elif left_start is None:
        if right_start is None:
            return 0
        else:
            return right_value
    else:
        # left_start is not None and left_fade
        if right_start is None:
            return left_value
        else:
            starts = left_start, current_frame, right_start
            return _interpolate_float(left_value, right_value, starts)


def _update_interpolate_color(dancer_name, part_name, part_obj):
    ld_light_type = getattr(part_obj, "ld_light_type")

    if ld_light_type == LightType.FIBER.value:
        action = ensure_action(part_obj, f"{part_name}Action")
        curves = [get_curve(action, "color", index=d) for d in range(3)]

        rgb_float = []
        for d in range(3):
            if curves[d] is None:
                # Basically should not happened
                raise Exception(f"No curves for action {part_name}Action")
                continue
            value = _prim_color_interpolation(curves[d])
            rgb_float.append(value)
        part_obj.color = (*rgb_float, 1.0)
    elif ld_light_type == LightType.LED.value:
        for led_obj in part_obj.children:
            position: int = getattr(led_obj, "ld_led_pos")

            action = ensure_action(led_obj, f"{part_name}Action.{position:03}")
            curves = [get_curve(action, "color", index=d) for d in range(3)]

            led_obj.color = (0.0, 0.0, 0.0, 1.0)
            rgb_float = []
            for d in range(3):
                if curves[d] is None:
                    # Basically should not happened
                    raise Exception(
                        f"No curves for action {part_name}Action.{position:03}"
                    )
                    continue
                value = _prim_color_interpolation(curves[d])
                rgb_float.append(value)
            led_obj.color = (*rgb_float, 1.0)
    else:
        return


def update_current_is_no_effect(self: bpy.types.Object, context: bpy.types.Context):
    if not bpy.context:
        return

    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return
    # print(self["ld_no_status"], "no status")

    ld_object_type = getattr(self, "ld_object_type")
    if ld_object_type != ObjectType.LIGHT.value:
        return

    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    this_part_name: str = getattr(self, "ld_part_name")

    this_is_none: bool = getattr(self, "ld_no_status")
    dancer_obj = getattr(self, "parent")

    dancer_obj_is_none = getattr(dancer_obj, "ld_no_status")
    if dancer_obj_is_none != this_is_none:
        setattr(dancer_obj, "ld_no_status", this_is_none)

        for part_obj in dancer_obj.children:
            other_is_none = getattr(part_obj, "ld_no_status")
            if other_is_none != this_is_none:
                setattr(part_obj, "ld_no_status", this_is_none)

    ld_has_status: bool = not getattr(self, "ld_no_status")
    if ld_has_status:
        ld_allow_override = getattr(self, "ld_allow_override_from_prev")
        if not ld_allow_override:
            return

        prev_fade = getattr(self, "ld_prev_fade")
        setattr(self, "ld_fade", prev_fade)

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
    else:
        _update_interpolate_color(ld_dancer_name, this_part_name, self)

    setattr(self, "ld_allow_override_from_prev", True)


def update_prev_attr(self: bpy.types.Object, context: bpy.types.Context):
    if not state.ready_to_edit_control or state.current_editing_detached:
        return

    ld_no_status: bool = getattr(self, "ld_no_status")
    if ld_no_status:
        setattr(self, "ld_no_status", False)


def update_prev_fade(self: bpy.types.Object, context: bpy.types.Context):
    if not state.ready_to_edit_control or state.current_editing_detached:
        return

    this_prev_fade: bool = getattr(self, "ld_prev_fade")
    dancer_obj = getattr(self, "parent")

    dancer_obj_prev_fade = getattr(dancer_obj, "ld_prev_fade")
    if dancer_obj_prev_fade != this_prev_fade:
        setattr(dancer_obj, "ld_prev_fade", this_prev_fade)

        for part_obj in dancer_obj.children:
            other_prev_fade = getattr(part_obj, "ld_prev_fade")
            if other_prev_fade != this_prev_fade:
                setattr(part_obj, "ld_prev_fade", this_prev_fade)

    ld_has_status = not getattr(self, "ld_no_status")
    if ld_has_status:
        return

    setattr(self, "ld_no_status", False)
    setattr(self, "ld_fade", this_prev_fade)
