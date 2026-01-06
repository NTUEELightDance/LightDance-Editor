# from copy import deepcopy
# from typing import cast

# from ....schemas.mutations import MutDancerLEDStatusPayload, MutDancerStatusPayload
# from ...models import (
#     RGB,
#     Color,
#     ControlMap,
#     ControlMapElement,
#     ControlMapLEDStatus,
#     ControlMapStatus,
#     FiberData,
#     LEDEffect,
#     MapID,
# )
# from ...states import state
# from ...utils.algorithms import OutOfRange, binary_search_for_neighbors
# from ...utils.convert import control_status_state_to_mut, led_status_state_to_mut
# from ...utils.for_dev_only.interpolate_color import (
#     RGBAInterpolateData,
#     interpolate,
#     is_interpolation,
# )

# type Time = int
# # model_name, part_name, effect_name, effect_item
# type LEDEffectStat = tuple[str, str, str, LEDEffect]
# type CtrlMapList = list[tuple[int, ControlMapElement]]


# # FIXME Finish tihis
# def interpolate_ctrl_status(
#     left_status: ControlMapStatus, right_status: ControlMapStatus, ratio: float
# ):  # -> tuple[list[MutDancerStatusPayload], list[Color]]:
#     usable_color_map: dict[FormalColor, Color | RGB] = {}
#     for colorID in state.color_map:
#         color = state.color_map[colorID]
#         usable_color_map[FormalColor.from_color(color)] = color

#     for dancer in state.dancers:
#         for part in state.dancers[dancer]:
#             left_data = left_status[dancer][part]
#             right_data = right_status[dancer][part]

#             if isinstance(left_data, FiberData):
#                 pass


# def interpolate_ctrl_led_status(
#     left_led_status: ControlMapLEDStatus,
#     right_led_status: ControlMapLEDStatus,
#     ratio: float,
#     color_to_be_added: list[Color],
# ) -> tuple[list[MutDancerLEDStatusPayload], list[Color], list[LEDEffectStat]]:
#     pass


# def interpolate_ctrl_from_neighbor(
#     left_elem_status: tuple[Time, ControlMapElement],
#     right_elem_status: tuple[Time, ControlMapElement],
#     start: int,
# ) -> tuple[
#     list[MutDancerStatusPayload],
#     list[MutDancerLEDStatusPayload],
#     list[Color],
#     list[LEDEffectStat],
# ]:
#     # it is constant, else it is fade
#     if not left_elem_status[1].fade:
#         mid_map_status = left_elem_status[1]
#         control_data = control_status_state_to_mut(mid_map_status.status)
#         led_control_data = led_status_state_to_mut(mid_map_status.led_status)
#         return control_data, led_control_data, [], []

#     left_start, left_ctrl_elem = left_elem_status
#     right_start, right_ctrl_elem = right_elem_status

#     # ratio: "left to mid" / "left to right"
#     ratio = float(start - left_start) / float(right_start - left_start)
#     control_data, old_color_data = interpolate_ctrl_status(
#         left_ctrl_elem.status, right_ctrl_elem.status, ratio
#     )
#     control_led_data, color_data, effect_data = interpolate_ctrl_led_status(
#         left_ctrl_elem.led_status, right_ctrl_elem.led_status, ratio, old_color_data
#     )
#     return control_data, control_led_data, color_data, effect_data


# def find_neighbor_frame(
#     sorted_ctrl_map: CtrlMapList, start: int
# ) -> tuple[int, int] | tuple[OutOfRange, OutOfRange]:
#     start_list = [ctrl_elem.start for _, ctrl_elem in sorted_ctrl_map]
#     binary_search_for_neighbors(start_list, start)
#     return binary_search_for_neighbors(start_list, start)


# def copy_first_ctrl_data(
#     sorted_ctrl_map: CtrlMapList,
# ) -> tuple[list[MutDancerStatusPayload], list[MutDancerLEDStatusPayload]]:
#     first_status = sorted_ctrl_map[0][1].status
#     first_led_status = sorted_ctrl_map[0][1].led_status
#     control_data = control_status_state_to_mut(first_status)
#     led_control_data = led_status_state_to_mut(first_led_status)
#     return control_data, led_control_data


# def copy_last_ctrl_data(
#     sorted_ctrl_map: CtrlMapList,
# ) -> tuple[list[MutDancerStatusPayload], list[MutDancerLEDStatusPayload]]:
#     last_status = sorted_ctrl_map[-1][1].status
#     last_led_status = sorted_ctrl_map[-1][1].led_status
#     control_data = control_status_state_to_mut(last_status)
#     led_control_data = led_status_state_to_mut(last_led_status)
#     return control_data, led_control_data


# def interpolate_ctrl(
#     start: int, ctrl_map: ControlMap
# ) -> tuple[
#     list[MutDancerStatusPayload],
#     list[MutDancerLEDStatusPayload],
#     list[Color],
#     list[LEDEffectStat],
# ]:
#     sorted_ctrl_map = sorted(ctrl_map.items(), key=lambda item: item[1].start)
#     prev_ctrl_start, next_ctrl_start = find_neighbor_frame(sorted_ctrl_map, start)

#     if prev_ctrl_start == "OutOfRange_Larger":
#         control_data, led_control_data = copy_last_ctrl_data(sorted_ctrl_map)
#         return control_data, led_control_data, [], []
#     elif prev_ctrl_start == "OutOfRange_Smaller":
#         control_data, led_control_data = copy_first_ctrl_data(sorted_ctrl_map)
#         return control_data, led_control_data, [], []

#     prev_ctrl_start = cast(int, prev_ctrl_start)
#     next_ctrl_start = cast(int, next_ctrl_start)

#     start_to_mapID_tuple = dict(
#         (ctrl_elem.start, mapID) for mapID, ctrl_elem in sorted_ctrl_map
#     )
#     prev_ctrl_mapID = start_to_mapID_tuple[prev_ctrl_start]
#     next_ctrl_mapID = start_to_mapID_tuple[next_ctrl_start]

#     prev_ctrl_elem_status = prev_ctrl_start, ctrl_map[prev_ctrl_mapID]
#     next_ctrl_elem_status = next_ctrl_start, ctrl_map[next_ctrl_mapID]
#     return interpolate_ctrl_from_neighbor(
#         prev_ctrl_elem_status, next_ctrl_elem_status, start
#     )
