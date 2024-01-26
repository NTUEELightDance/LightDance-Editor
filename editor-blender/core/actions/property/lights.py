from typing import List

import bpy

from ....properties.types import LightType
from ...models import EditMode
from ...states import state
from ...utils.convert import rgb_to_float


def update_current_color(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    color_id: int = self["ld_color"]
    color = state.color_map[color_id]
    color_float = rgb_to_float(color.rgb)

    self.color[0] = color_float[0]
    self.color[1] = color_float[1]
    self.color[2] = color_float[2]


def update_current_effect(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    effect_id: int = self["ld_effect"]
    effect = state.led_effect_id_table[effect_id]

    bulb_data = effect.effect
    led_bulb_objs: List[bpy.types.Object] = getattr(self, "children")

    for led_bulb_obj in led_bulb_objs:
        pos: int = getattr(led_bulb_obj, "ld_led_pos")
        data = bulb_data[pos]

        color = state.color_map[data.color_id]
        color_float = rgb_to_float(color.rgb)

        led_bulb_obj.color[0] = color_float[0]
        led_bulb_obj.color[1] = color_float[1]
        led_bulb_obj.color[2] = color_float[2]


def update_current_alpha(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type: str = getattr(self, "ld_light_type")
    ld_alpha: int = getattr(self, "ld_alpha")

    if ld_light_type == LightType.LED.value:
        led_bulb_objs: List[bpy.types.Object] = getattr(self, "children")
        for led_bulb_obj in led_bulb_objs:
            led_bulb_obj.color[3] = ld_alpha / 255
    else:
        self.color[3] = ld_alpha / 255
