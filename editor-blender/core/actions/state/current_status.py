import bpy

from ....properties.types import LightType
from ...models import FiberData, LEDData
from ...states import state
from ...utils.algorithms import binary_search


def calculate_current_status_index() -> int:
    if not bpy.context:
        return 0  # Won't actually happen
    return binary_search(state.control_start_record, bpy.context.scene.frame_current)


def update_current_status_by_index():
    """Update current status by index and set ld_color and ld_effect"""
    if not bpy.context:
        return
    index = state.current_control_index

    control_map = state.control_map
    control_id = state.control_record[index]

    current_control_map = control_map.get(control_id)
    if current_control_map is None:
        return

    setattr(bpy.context.window_manager, "ld_fade", current_control_map.fade)
    setattr(bpy.context.window_manager, "ld_start", current_control_map.start)

    current_status = current_control_map.status
    state.current_status = current_status

    for dancer in state.dancers_array:
        dancer_status = current_status.get(dancer.name)
        if dancer_status is None:
            continue

        dancer_part_objects = state.dancer_part_objects_map.get(dancer.name)
        if dancer_part_objects is not None:
            part_objects = dancer_part_objects[1]

            for part_name, part_obj in part_objects.items():
                light_type = getattr(part_obj, "ld_light_type")

                part_status = dancer_status.get(part_name)
                if part_status is None:
                    continue

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
