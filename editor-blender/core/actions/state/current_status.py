import bpy

from ....properties.types import LightType
from ...log import logger
from ...models import CtrlData, FiberData, LEDData
from ...states import state
from ...utils.algorithms import binary_search


def calculate_current_status_index() -> int:
    if not bpy.context:
        return 0  # Won't actually happen
    return binary_search(state.control_start_record, bpy.context.scene.frame_current)


def _update_current_status(
    ctrl_data: CtrlData | None,
    prev_ctrl_data: CtrlData | None,
    light_type: str,
    part_obj,
    ld_attr_types: tuple[str, str, str, str],
):
    ld_color, ld_alpha, ld_fade, ld_effect = ld_attr_types
    match light_type:
        case LightType.FIBER.value:
            if ctrl_data is None and prev_ctrl_data is None:
                default_color = list(state.color_map.keys())[0]
                default_color_name = state.color_map[default_color].name
                setattr(part_obj, ld_color, default_color_name)
                setattr(part_obj, ld_alpha, 0)
                setattr(part_obj, ld_fade, False)
                return
            elif ctrl_data is None:
                prev_data: FiberData = prev_ctrl_data.part_data  # type: ignore
                if not isinstance(prev_data, FiberData):
                    raise Exception("FiberData expected")

                color = state.color_map[prev_data.color_id].name
                setattr(part_obj, ld_color, color)
                setattr(part_obj, ld_alpha, prev_data.alpha)
                setattr(part_obj, ld_fade, prev_ctrl_data.fade)  # type: ignore
                return

            part_status = ctrl_data.part_data
            if not isinstance(part_status, FiberData):
                raise Exception("FiberData expected")

            color = state.color_map[part_status.color_id]
            setattr(part_obj, ld_color, color.name)
            alpha = part_status.alpha
            setattr(part_obj, ld_alpha, alpha)
            fade = ctrl_data.fade
            setattr(part_obj, ld_fade, fade)
        case LightType.LED.value:
            if ctrl_data is None and prev_ctrl_data is None:
                setattr(part_obj, ld_effect, "no-change")
                setattr(part_obj, ld_alpha, 0)
                setattr(part_obj, ld_fade, False)
                return
            elif ctrl_data is None:
                prev_data: LEDData = prev_ctrl_data.part_data  # type: ignore
                prev_led_status = prev_ctrl_data.bulb_data  # type: ignore

                if not isinstance(prev_data, LEDData):
                    raise Exception("LEDData expected")

                prev_effect_id = prev_data.effect_id
                if prev_effect_id == -1:
                    setattr(part_obj, ld_effect, "no-change")
                elif prev_effect_id == 0:
                    setattr(part_obj, ld_effect, "[Bulb Color]")
                    for led_bulb_obj in part_obj.children:
                        pos: int = getattr(led_bulb_obj, "ld_led_pos")
                        data = prev_led_status[pos]
                        if data.color_id != -1:
                            color = state.color_map[data.color_id]
                            setattr(led_bulb_obj, ld_color, color.name)
                        else:
                            setattr(led_bulb_obj, ld_color, "[gradient]")
                        setattr(led_bulb_obj, ld_alpha, data.alpha)
                else:
                    effect = state.led_effect_id_table[prev_effect_id]
                    setattr(part_obj, ld_effect, effect.name)

                alpha = prev_data.alpha
                setattr(part_obj, ld_alpha, alpha)
                fade = prev_ctrl_data.fade  # type: ignore
                setattr(part_obj, ld_fade, fade)
                return

            part_status = ctrl_data.part_data
            part_led_status = ctrl_data.bulb_data

            if not isinstance(part_status, LEDData):
                raise Exception("LEDData expected")

            effect_id = part_status.effect_id
            if effect_id == -1:
                setattr(part_obj, ld_effect, "no-change")
            elif effect_id == 0:
                setattr(part_obj, ld_effect, "[Bulb Color]")
                for led_bulb_obj in part_obj.children:
                    pos: int = getattr(led_bulb_obj, "ld_led_pos")
                    data = part_led_status[pos]
                    if data.color_id != -1:
                        color = state.color_map[data.color_id]
                        setattr(led_bulb_obj, ld_color, color.name)
                    else:
                        setattr(led_bulb_obj, ld_color, "[gradient]")
                    setattr(led_bulb_obj, ld_alpha, data.alpha)
            else:
                effect = state.led_effect_id_table[effect_id]
                setattr(part_obj, ld_effect, effect.name)

            alpha = part_status.alpha
            setattr(part_obj, ld_alpha, alpha)
            fade = ctrl_data.fade
            setattr(part_obj, ld_fade, fade)
        case _:
            pass


def update_current_status_by_index():
    """Update current status by index and set ld_color and ld_effect"""
    if not bpy.context:
        return

    index = state.current_control_index

    control_map = state.control_map
    if not control_map:
        return

    control_id = state.control_record[index]
    current_control_map = control_map.get(control_id)

    if current_control_map is None:
        return

    # setattr(
    #     bpy.context.window_manager,
    #     "ld_default_fade",
    #     current_control_map.fade_for_new_status,
    # )
    setattr(bpy.context.window_manager, "ld_start", current_control_map.start)

    current_ctrl_status = current_control_map.status
    state.current_status = current_control_map.status
    # state.current_led_status = current_led_status

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer in state.dancers_array:
        if not show_dancer_dict[dancer.name]:
            continue

        dancer_status = current_ctrl_status.get(dancer.name)
        # dancer_led_status = current_led_status.get(dancer.name)
        if dancer_status is None:  # or dancer_led_status is None:
            continue

        dancer_part_objects = state.dancer_part_objects_map.get(dancer.name)
        if dancer_part_objects is not None:
            part_objects = dancer_part_objects[1]

            first_part_name = list(part_objects)[0]
            prev_notnone_index = index
            while True:
                prev_notnone_index -= 1
                if prev_notnone_index <= -1:
                    break

                prev_control_id = state.control_record[prev_notnone_index]
                prev_ctrl_data = state.control_map[prev_control_id].status[dancer.name][
                    first_part_name
                ]
                if prev_ctrl_data is not None:
                    break

            for part_name, part_obj in part_objects.items():
                try:
                    light_type = getattr(part_obj, "ld_light_type")
                except ReferenceError:
                    logger.error(
                        f"StructRNA of part object {part_obj} with a part name {part_name} has been removed"
                    )
                    continue

                ctrl_data = dancer_status.get(part_name)

                prev_ctrl_data = None
                if prev_notnone_index >= 0:
                    prev_ctrl_data = state.control_map[prev_control_id].status[
                        dancer.name
                    ][part_name]

                # update previous status
                current_ld_attr_type = (
                    "ld_prev_color",
                    "ld_prev_alpha",
                    "ld_prev_fade",
                    "ld_prev_effect",
                )
                _update_current_status(
                    None, prev_ctrl_data, light_type, part_obj, current_ld_attr_type
                )

                if ctrl_data is None:
                    pass
                    setattr(part_obj, "ld_no_status", True)
                else:
                    current_ld_attr_type = (
                        "ld_color",
                        "ld_alpha",
                        "ld_fade",
                        "ld_effect",
                    )
                    _update_current_status(
                        ctrl_data,
                        prev_ctrl_data,
                        light_type,
                        part_obj,
                        current_ld_attr_type,
                    )
                    setattr(part_obj, "ld_no_status", False)
