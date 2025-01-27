import bpy

from ....properties.types import LightType
from ...models import ColorID, EditMode, LEDData
from ...states import state
from ...utils.convert import rgb_to_float, rgba_to_float

"""
Controlling temporary object color in Blender using lightdance props as edit preview.

`ld_color`: Color ID
`ld_alpha`: Alpha value (0-255) == Brightness != Blender object alpha.

Fiber: Use `ld_color` and `ld_alpha` to determine blender object color.
LED:
- Effect != 0 (Effect mode)
  - Use effect to determine `ld_color` (on bulb) and `ld_alpha` (on parent).
  - Effect == -1: Use previous effect ("no effect").
- Effect == 0 (Single bulb mode)
  - Use `ld_color` and `ld_alpha` (both on bulb) to determine blender object color.
  - If `ld_color` == -1, interpolate gradient between adjacent bulbs.
    - Colors are determined by `ld_color_float`.
    - If both ends are -1, fill with black.
    - `ld_alpha` is set to 255 to remove effect of `update_current_alpha`.
"""


def update_current_color(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_alpha: int = getattr(self, "ld_alpha")

    if (ld_light_type := getattr(self, "ld_light_type")) == LightType.LED.value:
        return
    if ld_light_type == LightType.LED_BULB.value:
        if self.parent and self.parent["ld_effect"] == 0:
            update_gradient_color(self.parent)
            return
    color_id: int = self["ld_color"]
    color = state.color_map[color_id]
    color_float = rgba_to_float(color.rgb, ld_alpha)

    setattr(self, "ld_color_float", color_float[:3])

    self.color = (*color_float, 1.0)


def update_current_effect(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
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
            prev_control_map = state.control_map[prev_control_id]

            ld_dancer_name: str = getattr(self, "ld_dancer_name")
            prev_dancer_status = prev_control_map.status[ld_dancer_name]

            ld_part_name: str = getattr(self, "ld_part_name")
            prev_part_status = prev_dancer_status[ld_part_name]

            if not isinstance(prev_part_status, LEDData):
                raise Exception("LEDData expected")

            if prev_part_status.effect_id != -1:
                effect_id = prev_part_status.effect_id
                break

            control_index -= 1

    else:
        if effect_id == 0:
            return  # Do nothing, let update_current_color handle it
        else:
            effect = state.led_effect_id_table[effect_id]

            bulb_data = effect.effect

        led_bulb_objs: list[bpy.types.Object] = getattr(self, "children")

        for led_bulb_obj in led_bulb_objs:
            pos: int = getattr(led_bulb_obj, "ld_led_pos")
            data = bulb_data[pos]

            color = state.color_map[data.color_id]
            setattr(led_bulb_obj, "ld_color", color.name)


def update_current_alpha(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type: str = getattr(self, "ld_light_type")
    ld_alpha: int = getattr(self, "ld_alpha")
    ld_color_float: list[float] = getattr(self, "ld_color_float")

    if ld_light_type == LightType.LED.value and self["ld_effect"] != 0:
        led_bulb_objs: list[bpy.types.Object] = getattr(self, "children")
        for led_bulb_obj in led_bulb_objs:
            bulb_ld_color_float: list[float] = getattr(led_bulb_obj, "ld_color_float")
            led_bulb_obj.color[0] = bulb_ld_color_float[0] * (ld_alpha / 255)
            led_bulb_obj.color[1] = bulb_ld_color_float[1] * (ld_alpha / 255)
            led_bulb_obj.color[2] = bulb_ld_color_float[2] * (ld_alpha / 255)
    else:
        self.color[0] = ld_color_float[0] * (ld_alpha / 255)
        self.color[1] = ld_color_float[1] * (ld_alpha / 255)
        self.color[2] = ld_color_float[2] * (ld_alpha / 255)


def update_gradient_color(led_obj: bpy.types.Object):
    """
    Cut LED status into segments and interpolate gradient for color_id=-1. Then update color.
    NOTE: The segments are sliced while preserving head and tail.
    e.g. Color ID : `-1, 1, -1, -1, 2, 3 -> [[-1, 1], [1], [1, -1, -1, 2], [2], [3]]`
    """
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
    segments: list[list[tuple[ColorID, int]]] = []
    head = 0
    for i, bulb_status in enumerate(led_status):
        if bulb_status[0] == -1 and i != len(led_status) - 1:
            continue
        elif head != i:
            segments.append(led_status[head : i + 1])
            head = i
        if bulb_status[0] != -1:
            segments.append([bulb_status])
            head = i

    rgb_float_list: list[tuple[float, ...]] = []
    for segment in segments:
        print(interpolate_gradient(segment))
        rgb_float_list.extend(interpolate_gradient(segment))

    for index, (led_bulb_obj, rgb_float) in enumerate(
        zip(led_obj.children, rgb_float_list)
    ):
        led_bulb_obj.color = (*rgb_float, 1.0)
        setattr(led_bulb_obj, "ld_color_float", rgb_float)
        if led_status[index][0] == -1:
            setattr(led_bulb_obj, "ld_alpha", 255)


def interpolate_gradient(
    bulb_segment: list[tuple[ColorID, int]]
) -> list[tuple[float, ...]]:
    """
    Linearly interpolate color gradient.
    Rules:
    - If input is a single color, return it.
    - If both head and tail are specified, interpolate between them.
    - If head color is -1, fill with tail color.
    - If tail color is -1, fill with head color.
    - If both head and tail are -1, fill with black.
    """
    color_map = state.color_map
    length = len(bulb_segment) - 2

    head_color_id, head_alpha = bulb_segment[0]
    if length == -1:  # Single specified color
        return [rgba_to_float(color_map[head_color_id].rgb, head_alpha)]
    if length == 0:
        return []

    tail_color_id, tail_alpha = bulb_segment[-1]
    if head_color_id == -1:
        if tail_color_id == -1:
            return [(0.0, 0.0, 0.0)] * length  # No color specified, return black
        else:
            return [rgba_to_float(color_map[tail_color_id].rgb, tail_alpha)] * (
                length + 1
            )  # Fill with tail color
    elif tail_color_id == -1:
        return [rgba_to_float(color_map[head_color_id].rgb, head_alpha)] * (length + 1)

    head_rgb_float = rgba_to_float(color_map[head_color_id].rgb, head_alpha)
    tail_rgb_float = rgba_to_float(color_map[tail_color_id].rgb, tail_alpha)
    delta_float = [
        (tail_rgb_float[i] - head_rgb_float[i]) / (length + 1) for i in range(3)
    ]
    return [
        tuple(head_rgb_float[d] + delta_float[d] * (i + 1) for d in range(3))
        for i in range(length)
    ]
