# import time
from typing import List, Optional

import bpy

from ....properties.types import LightType, ObjectType
from ...models import FiberData, LEDData
from ...states import state
from ...utils.algorithms import binary_search


def calculate_current_status_index() -> int:
    return binary_search(state.control_start_record, bpy.context.scene.frame_current)


def update_current_status_by_index():
    """Update current status by index and set ld_color and ld_effect"""
    index = state.current_control_index

    control_map = state.control_map
    control_id = state.control_record[index]

    current_control_map = control_map.get(control_id)
    if current_control_map is None:
        return

    current_status = current_control_map.status
    current_led_status = current_control_map.led_status
    state.current_status = current_status
    state.current_led_status = current_led_status

    for dancer in state.dancers_array:
        # stime = time.time()
        dancer_status = current_status.get(dancer.name)
        if dancer_status is None:
            continue

        dancer_part_objects = state.dancer_part_objects_map.get(dancer.name)
        if dancer_part_objects is not None:
            part_objects = dancer_part_objects[1]

            for part_name, part_obj in part_objects.items():
                # stime = time.time()
                light_type = getattr(part_obj, "ld_light_type")

                part_status = dancer_status.get(part_name)
                if part_status is None:
                    continue
                # print(f"get part_status: {time.time() - stime}")

                # stime = time.time()
                match light_type:
                    case LightType.FIBER.value:
                        if not isinstance(part_status, FiberData):
                            raise Exception("FiberData expected")

                        color = state.color_map[part_status.color_id]
                        setattr(part_obj, "ld_color", color.name)
                        alpha = part_status.alpha
                        setattr(part_obj, "ld_alpha", alpha)
                    case LightType.LED.value:
                        if not isinstance(part_status, LEDData):
                            raise Exception("LEDData expected")

                        effect_id = part_status.effect_id
                        if effect_id == -1:
                            setattr(part_obj, "ld_effect", "no-change")
                        else:
                            effect = state.led_effect_id_table[effect_id]
                            setattr(part_obj, "ld_effect", effect.name)

                        alpha = part_status.alpha
                        setattr(part_obj, "ld_alpha", alpha)

                    case _:
                        pass
                # print(f"set ld_color and ld_effect: {time.time() - stime}")
