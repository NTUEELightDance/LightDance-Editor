from typing import List

import bpy

from ....properties.types import LightType
from ...models import EditMode, LEDData
from ...states import state
from ...utils.convert import rgb_to_float


def update_current_color(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_alpha: int = getattr(self, "ld_alpha")

    color_id: int = self["ld_color"]
    color = state.color_map[color_id]
    color_float = rgb_to_float(color.rgb)

    setattr(self, "ld_color_float", color_float[:3])

    self.color[0] = color_float[0] * (ld_alpha / 255)
    self.color[1] = color_float[1] * (ld_alpha / 255)
    self.color[2] = color_float[2] * (ld_alpha / 255)


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

            prev_dancer_status = prev_control_map.status[ld_dancer_name]

            prev_part_status = prev_dancer_status[ld_part_name]

            if not isinstance(prev_part_status, LEDData):
                raise Exception("LEDData expected")

            if prev_part_status.effect_id != -1:
                effect_id = prev_part_status.effect_id
                break

            control_index -= 1

    if effect_id != -1:
        if effect_id > 0:
            effect = state.led_effect_id_table[effect_id]
            bulb_data = effect.effect
        else:  # use bulb data
            control_index = state.editing_data.frame_id
            bulb_data = state.control_map[control_index].led_status[ld_dancer_name][
                ld_part_name
            ]
        led_bulb_objs: List[bpy.types.Object] = getattr(self, "children")

        for led_bulb_obj in led_bulb_objs:
            pos: int = getattr(led_bulb_obj, "ld_led_pos")
            data = bulb_data[pos]

            color = state.color_map[data.color_id]
            setattr(led_bulb_obj, "ld_color", color.name)
            update_current_color(led_bulb_obj, context)

    else:
        led_bulb_objs: List[bpy.types.Object] = getattr(self, "children")
        for led_bulb_obj in led_bulb_objs:
            setattr(led_bulb_obj, "ld_color", "black")


def update_current_alpha(self: bpy.types.Object, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    ld_light_type: str = getattr(self, "ld_light_type")
    ld_alpha: int = getattr(self, "ld_alpha")
    ld_color_float: List[float] = getattr(self, "ld_color_float")

    if ld_light_type == LightType.LED.value:
        led_bulb_objs: List[bpy.types.Object] = getattr(self, "children")
        for led_bulb_obj in led_bulb_objs:
            bulb_ld_color_float: List[float] = getattr(led_bulb_obj, "ld_color_float")
            led_bulb_obj.color[0] = bulb_ld_color_float[0] * (ld_alpha / 255)
            led_bulb_obj.color[1] = bulb_ld_color_float[1] * (ld_alpha / 255)
            led_bulb_obj.color[2] = bulb_ld_color_float[2] * (ld_alpha / 255)
            setattr(led_bulb_obj, "ld_alpha", ld_alpha)
    else:
        self.color[0] = ld_color_float[0] * (ld_alpha / 255)
        self.color[1] = ld_color_float[1] * (ld_alpha / 255)
        self.color[2] = ld_color_float[2] * (ld_alpha / 255)
