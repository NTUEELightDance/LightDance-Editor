import sys
from copy import deepcopy
from enum import Enum
from typing import Literal, cast

from ....core.models import (
    RGB,
    RGBA,
    ControlMap_MODIFIED,
    ControlMapElement,
    ControlMapElement_MODIFIED,
    ControlMapStatus_MODIFIED,
    CtrlData,
    DancerName,
    FiberData,
    LEDBulbData,
    LEDData,
    Location,
    MapID,
    PartName,
    Position,
    PosMap,
    Rotation,
    Time,
)
from ....core.states import state

# from ....core.utils.for_dev_only.interpolate_color import (
#     ActualRGB,
#     RGBAInterpolateData,
#     interpolate,
#     is_interpolation,
# )
# from ....core.utils.for_dev_only.interpolate_pos import (
#     PosHistory,
#     PosInterpolateData,
#     interpolate_pos,
#     is_interpolation_of_pos,
# )


CtrlHistory = list[tuple[MapID, Time, CtrlData]]
FrameData = tuple[MapID, Time]


class PartType(Enum):
    Fiber = 0
    LED = 1


class _EffectType(Enum):
    NoEffect = 0


NoEffect = Literal[_EffectType.NoEffect]


# def position_interpolate(
#     position_list: list[Position],
#     frame_list: list[int],
#     target_frame: int,
#     target_position: Position,
# ):
#     # dict[str, int] is [x, y, z, rx, ry, rz]
#     flattened_position_list: list[dict[str, int]] = []
#     for position in position_list:
#         flattened_location = position.location.__dict__
#         flattened_rotation = position.rotation.__dict__
#         flattened_position = {**flattened_location, **flattened_rotation}
#         flattened_position_list.append(flattened_position)

#     target_position_list: list[float] = []
#     for attr in ["x", "y", "z", "rx", "ry", "rz"]:
#         left_weight = float(target_frame - frame_list[0])
#         right_weight = float(frame_list[1] - target_frame)
#         position_interpolated_attr = (
#             left_weight * flattened_position_list[1][attr]
#             + right_weight * flattened_position_list[0][attr]
#         ) / (left_weight + right_weight)
#         target_position_list.append(position_interpolated_attr)

#     target_position.location = Location(
#         x=target_position_list[0], y=target_position_list[1], z=target_position_list[2]
#     )
#     target_position.rotation = Rotation(
#         rx=target_position_list[3],
#         ry=target_position_list[4],
#         rz=target_position_list[5],
#     )


# def to_actual_rgb(rgba: RGBA) -> ActualRGB:
#     alpha = rgba[3]
#     partial_rgb = cast(RGB, tuple(rgba[i] for i in range(3)))
#     actual_RGB_map = map(lambda num: float(num) * float(alpha), partial_rgb)
#     return cast(ActualRGB, tuple(actual_RGB_map))


# def color_interpolate(
#     left_color: ActualRGB, right_color: ActualRGB, left_weight: int, right_weight: int
# ) -> ActualRGB:
#     total_weight: float = float(left_weight + right_weight)
#     left_normed_weight = float(left_weight) / total_weight
#     right_normed_weight = 1 - left_normed_weight

#     target_color_list: list[float] = []
#     for i in range(3):
#         primary_color_value = (
#             left_color[i] * right_normed_weight + right_color[i] * left_normed_weight
#         )
#         target_color_list.append(primary_color_value)

#     return cast(ActualRGB, tuple(target_color_list))


# def _gradient_interpolate(
#     last_rgba_color: RGBA,
#     this_rgba_color: RGBA,
#     num_to_be_interpolate: int,
#     effect_rgba: list[RGBA],
# ):
#     total_weight = num_to_be_interpolate + 1
#     for weight in range(1, num_to_be_interpolate + 1):
#         left_interpolate_data: RGBAInterpolateData = (last_rgba_color, weight)
#         right_interpolate_data: RGBAInterpolateData = (
#             this_rgba_color,
#             total_weight - weight,
#         )
#         gradient_rgba = interpolate(left_interpolate_data, right_interpolate_data)
#         effect_rgba.append(gradient_rgba)


# def _handle_each_bulb(bulb_list: list[LEDBulbData]) -> list[RGBA]:
#     BLACK: RGBA = (0, 0, 0, 255)
#     effect_rgba: list[RGBA] = []

#     num_of_color_to_be_interpolate = 0
#     last_rgba_color: RGBA = BLACK
#     is_first_color = True

#     for bulb in bulb_list:
#         # has color
#         if bulb.color_id != -1:
#             bulb.rgb = cast(RGB, bulb.rgb)
#             this_rgba_color = (*bulb.rgb, bulb.alpha)

#             # interpolate colors
#             if num_of_color_to_be_interpolate != 0:
#                 _gradient_interpolate(
#                     last_rgba_color,
#                     this_rgba_color,
#                     num_of_color_to_be_interpolate,
#                     effect_rgba,
#                 )
#                 num_of_color_to_be_interpolate = 0

#             last_rgba_color = this_rgba_color
#             effect_rgba.append(this_rgba_color)
#         # waiting for interpolation
#         else:
#             if is_first_color:
#                 effect_rgba.append(BLACK)
#             else:
#                 num_of_color_to_be_interpolate += 1

#         is_first_color = False

#     # last color.id = -1
#     if num_of_color_to_be_interpolate > 0:
#         if num_of_color_to_be_interpolate == 1:
#             effect_rgba.append(BLACK)
#         else:
#             _gradient_interpolate(
#                 last_rgba_color,
#                 BLACK,
#                 num_of_color_to_be_interpolate - 1,  # do not count the last color
#                 effect_rgba,
#             )
#             effect_rgba.append(BLACK)

#     return effect_rgba


# def _handle_effect(
#     part_data: LEDData,
#     flattened_color_list: list[list[RGBA]],
# ):
#     effect_id = part_data.effect_id
#     # no effect => not possible, for it is picked by _is_no_effect()
#     # if part_data.effect_id == -1:
#     #     flattened_color_list.append(_EffectType.NoEffect)

#     # effect mode
#     if effect_id != 0:
#         alpha = part_data.alpha
#         # check effect in led_effect_table
#         effect = state.led_effect_id_table[part_data.effect_id]
#         effect_rgb = [cast(RGB, bulb.rgb) for bulb in effect.effect]
#         effect_rgba = [(*bulb_rgb, alpha) for bulb_rgb in effect_rgb]
#         flattened_color_list.append(effect_rgba)

#     # single bulb mode
#     else:
#         effect = state.led_effect_id_table[part_data.effect_id]
#         bulb_list = effect.effect
#         effect_rgba = _handle_each_bulb(bulb_list)

#         flattened_color_list.append(effect_rgba)


# def _is_ctrl_part_interpolation(
#     part_type: PartType,
#     flattened_color_list: list[RGBA] | list[list[RGBA]],
#     frame_list: list[int],
# ):
#     # list[RGBA]
#     if part_type == PartType.Fiber:
#         flattened_color_list = cast(list[RGBA], flattened_color_list)
#         left_data: RGBAInterpolateData = (
#             flattened_color_list[0],
#             (frame_list[1] - frame_list[0]),
#         )
#         right_data: RGBAInterpolateData = (
#             flattened_color_list[2],
#             (frame_list[2] - frame_list[1]),
#         )
#         if not is_interpolation(left_data, right_data, flattened_color_list[1]):
#             return False
#     # list[list[ActualRGB]]
#     else:
#         flattened_color_list = cast(list[list[RGBA]], flattened_color_list)

#         for bulb_index in range(len(flattened_color_list[0])):
#             first_color = flattened_color_list[0][bulb_index]
#             second_color = flattened_color_list[1][bulb_index]
#             third_color = flattened_color_list[2][bulb_index]

#             left_data: RGBAInterpolateData = (
#                 first_color,
#                 (frame_list[1] - frame_list[0]),
#             )
#             right_data: RGBAInterpolateData = (
#                 third_color,
#                 (frame_list[2] - frame_list[1]),
#             )
#             if not is_interpolation(left_data, right_data, second_color):
#                 return False

#     return True


# def _is_interpolation_of_ctrl(last_three_not_none_ctrl: CtrlHistory):
#     control_list = [control[2] for control in last_three_not_none_ctrl]
#     frame_list = [control[1] for control in last_three_not_none_ctrl]

#     flattened_color_list: list[RGBA] | list[list[RGBA]] = []

#     part_type: PartType
#     if isinstance(control_list[0].part_data, FiberData):
#         part_type = PartType.Fiber
#     else:
#         part_type = PartType.LED

#     for control in control_list:
#         # FiberData
#         if part_type == PartType.Fiber:
#             flattened_color_list = cast(list[RGBA], flattened_color_list)
#             part_data = cast(FiberData, control.part_data)

#             rgb = state.color_map[part_data.color_id].rgb
#             rgba = *rgb, control.part_data.alpha
#             flattened_color_list.append(rgba)
#         # LEDData
#         else:
#             flattened_color_list = cast(list[list[RGBA]], flattened_color_list)
#             part_data = cast(LEDData, control.part_data)

#             _handle_effect(part_data, flattened_color_list)

#     return _is_ctrl_part_interpolation(part_type, flattened_color_list, frame_list)


# def _is_no_effect(this_control: tuple[MapID, Time, CtrlData]):
#     this_control_data = this_control[2]

#     if isinstance(this_control_data.part_data, FiberData):
#         return False
#     cast(LEDData, this_control_data)

#     if this_control_data.part_data.effect_id == -1:
#         return True
#     else:
#         return False


def _rough_conv_control_status_to_old(
    old_control_map_element: ControlMapElement, fade: bool
) -> ControlMapStatus_MODIFIED:
    """
    One-to-one transform, do not convert stat to None.
    """
    control_map_status = {}
    for dancer, part_list in state.dancers.items():
        dancer_map = {}
        for part in part_list:
            part_data = old_control_map_element.status[dancer][part]
            bulb_data = old_control_map_element.led_status[dancer][part]
            dancer_map[part] = CtrlData(
                part_data=part_data, bulb_data=bulb_data, fade=fade
            )
        control_map_status[dancer] = dancer_map
    return control_map_status


def _rough_conv_control_map_from_old():
    """
    One-to-one transform, do not convert stat to None.
    """
    state.control_map_MODIFIED = {}
    deepcopy_control_map_items = deepcopy(state.control_map).items()
    for mapID, control_map_element in deepcopy_control_map_items:
        control_map_status = _rough_conv_control_status_to_old(
            control_map_element, control_map_element.fade
        )
        control_map_element_status = ControlMapElement_MODIFIED(
            start=control_map_element.start,
            fade_for_new_status=False,
            rev=control_map_element.rev,
            status=control_map_status,
        )
        state.control_map_MODIFIED[mapID] = control_map_element_status


# def _init_pos_x(index, total):
#     if total == 1:
#         return 0.0

#     total_length = total - 1
#     half_length = total_length / 2
#     left_point = -half_length
#     right_point = half_length

#     x = (left_point * (total_length - index) + right_point * index) / total_length
#     return x


# def conv_control_map_to_new():
#     pass


# Override state.pos_map_MODIFIED to state.pos_map
# def sync_pos_map_to_new():
#     state.pos_map = deepcopy(state.pos_map_MODIFIED)
#     pos_map = state.pos_map
#     sorted_pos_map = sorted(pos_map.items(), key=lambda item: item[1].start)

#     dancer_num = len(state.dancer_names)
#     for index, dancer in enumerate(state.dancer_names):
#         last_position: tuple[MapID, int, Position] | None = None

#         init_x = _init_pos_x(index, dancer_num)
#         empty_position = Position(
#             location=Location(x=init_x, y=0, z=0), rotation=Rotation(rx=0, ry=0, rz=0)
#         )
#         nopos_mapData: list[FrameData] = []

#         for mapID, pos_elem in sorted_pos_map:
#             frame_number = state.pos_map[mapID].start
#             pos_of_dancer = pos_map[mapID].pos[dancer]

#             if last_position is None:
#                 if pos_of_dancer is None:
#                     last_position = mapID, frame_number, empty_position
#                 else:
#                     last_position = mapID, frame_number, pos_of_dancer

#                 continue

#             if pos_of_dancer is None:
#                 frame_data = mapID, frame_number
#                 nopos_mapData.append(frame_data)
#                 continue

#             if nopos_mapData:
#                 for nopos_mapID, nopos_frame in nopos_mapData:
#                     left_data: PosInterpolateData = (last_position[2], last_position[1])
#                     right_data: PosInterpolateData = (pos_of_dancer, frame_number)
#                     nopos_pos_of_dancer = interpolate_pos(
#                         left_data, right_data, nopos_frame
#                     )
#                     pos_map[nopos_mapID].pos[dancer] = nopos_pos_of_dancer

#                 nopos_mapData.clear()

#         if nopos_mapData:
#             for nopos_mapID, nopos_frame in nopos_mapData:
#                 last_position = cast(tuple[MapID, int, Position], last_position)
#                 pos_map[nopos_mapID].pos[dancer] = last_position[2]

#             nopos_mapData.clear()


# Override state.control_map_MODIFIED to state.control_map
def sync_new_ctrl_map_from_old():
    _rough_conv_control_map_from_old()


# Override state.pos_map_MODIFIED to state.pos_map
def sync_new_pos_map_from_old():
    state.pos_map_MODIFIED = deepcopy(state.pos_map)
    # pos_map = state.pos_map
    # sorted_pos_map = sorted(pos_map.items(), key=lambda item: item[1].start)

    # for dancer in state.dancer_names:
    #     # keep all position history that is not None (not interpolated in new map)
    #     non_none_position_history: PosHistory = []

    #     for mapID, pos_map_elem in sorted_pos_map:
    #         start = pos_map_elem.start
    #         pos_of_dancer = pos_map_elem.pos[dancer]
    #         pos_of_dancer = cast(Position, pos_of_dancer)

    #         this_position = mapID, start, pos_of_dancer
    #         non_none_position_history.append(this_position)
    #         if len(non_none_position_history) < 3:
    #             continue

    #         # If last three position is arithmetic sequence,
    #         # pop the -2th (middle of last three non-None position) position history, and change the corresponding pos map to None
    #         last_three_non_none_position = non_none_position_history[-3:]
    #         if is_interpolation_of_pos(last_three_non_none_position):
    #             interpolated_dancer_mapID = non_none_position_history[-2][0]
    #             state.pos_map_MODIFIED[interpolated_dancer_mapID].pos[dancer] = None
    # non_none_position_history.pop(-2)
