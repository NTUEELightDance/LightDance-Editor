from typing import List, Optional

import bpy

from ...models import ControlMapElement, FiberData, LEDData, PartType
from ...states import state


def calculate_current_status_index() -> int:
    frame_start_list = [state.control_map[id].start for id in state.control_record]
    current_frame = bpy.context.scene.frame_current
    for i, start in enumerate(frame_start_list):
        if start <= current_frame:
            if i + 1 < len(frame_start_list):
                next_start = frame_start_list[i + 1]
                if current_frame < next_start:
                    return i
            else:
                return i

    return 0


def update_current_status_by_index():
    """Update current status by index and set ld_color and ld_effect"""
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

        dancer_obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer.name)
        if dancer_obj is not None:
            part_objs: List[bpy.types.Object] = getattr(dancer_obj, "children")
            # TODO: Add this in state
            part_obj_names: List[str] = [
                getattr(obj, "ld_part_name") for obj in part_objs
            ]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]
                part_status = dancer_status[part.name]

                match part.type:
                    case PartType.FIBER:
                        if not isinstance(part_status, FiberData):
                            raise Exception("FiberData expected")

                        color = state.color_map[part_status.color_id]
                        setattr(part_obj, "ld_color", color.name)
                        alpha = part_status.alpha
                        setattr(part_obj, "ld_alpha", alpha)
                    case PartType.LED:
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
