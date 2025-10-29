import sys
from copy import deepcopy
from typing import cast

from ....core.models import (
    RGB,
    ControlMapElement,
    ControlMapElementMODIFIED,
    ControlMapMODIFIED,
    ControlMapStatusMODIFIED,
    DancerName,
    FiberData,
    LEDData,
    Location,
    MapID,
    PartAndLEDData,
    PartName,
    Position,
    PosMap,
    Rotation,
)
from ....core.states import state

CtrlHistory = list[tuple[MapID, int, PartAndLEDData]]
PosHistory = list[tuple[MapID, int, Position]]
RGBA = tuple[int, int, int, int]
ActualRGB = tuple[float, float, float]


def position_of_dancer(
    pos_map: PosMap, dancer: DancerName, mapID: MapID
) -> Position | None:
    return pos_map[mapID].pos[dancer]


def position_interpolate(
    position_list: list[Position],
    frame_list: list[int],
    target_frame: int,
    target_position: Position,
):
    # dict[str, int] is [x, y, z, rx, ry, rz]
    flattened_position_list: list[dict[str, int]] = []
    for position in position_list:
        flattened_location = position.location.__dict__
        flattened_rotation = position.rotation.__dict__
        flattened_position = {**flattened_location, **flattened_rotation}
        flattened_position_list.append(flattened_position)

    target_position_list: list[float] = []
    for attr in ["x", "y", "z", "rx", "ry", "rz"]:
        left_weight = float(target_frame - frame_list[0])
        right_weight = float(frame_list[1] - target_frame)
        position_interpolated_attr = (
            left_weight * flattened_position_list[1][attr]
            + right_weight * flattened_position_list[0][attr]
        ) / (left_weight + right_weight)
        target_position_list.append(position_interpolated_attr)

    target_position.location = Location(
        x=target_position_list[0], y=target_position_list[1], z=target_position_list[2]
    )
    target_position.rotation = Rotation(
        rx=target_position_list[3],
        ry=target_position_list[4],
        rz=target_position_list[5],
    )


def to_actual_rgb(rgba: RGBA) -> ActualRGB:
    alpha = rgba[3]
    partial_rgb = cast(RGB, tuple(rgba[i] for i in range(3)))
    actual_RGB_map = map(lambda num: float(num) * float(alpha), partial_rgb)
    return cast(ActualRGB, tuple(actual_RGB_map))


def color_interpolate(
    left_color: ActualRGB, right_color: ActualRGB, left_weight: int, right_weight: int
) -> ActualRGB:
    total_weight: float = float(left_weight + right_weight)
    left_normed_weight = float(left_weight) / total_weight
    right_normed_weight = 1 - left_normed_weight

    target_color_list: list[float] = []
    for i in range(3):
        primary_color_value = (
            left_color[i] * right_normed_weight + right_color[i] * left_normed_weight
        )
        target_color_list.append(primary_color_value)

    return cast(ActualRGB, tuple(target_color_list))


def gradient_interpolate(
    last_actual_rgb_color: ActualRGB,
    this_color: RGBA,
    num_to_be_interpolate: int,
    effect_rgba: list[ActualRGB],
):
    this_actual_rgb_color = to_actual_rgb(this_color)
    denominator = num_to_be_interpolate + 1
    for i in range(1, denominator):
        gradient_color = color_interpolate(
            last_actual_rgb_color, this_actual_rgb_color, denominator - i, i
        )
        effect_rgba.append(gradient_color)


def handle_effect(
    part_data: LEDData,
    flattened_color_list: list[list[ActualRGB]],
    control_history: CtrlHistory,
    curent_index: int,
):
    effect_id = part_data.effect_id
    # no effect
    if part_data.effect_id == -1:
        prev_index = curent_index - 1
        while prev_index > 0:
            prev_ctrl_data = control_history[curent_index][2]
            prev_part_data = prev_ctrl_data.part_data

            if not isinstance(prev_ctrl_data.part_data, LEDData):
                raise Exception("LEDData expected")

            prev_part_data = cast(LEDData, prev_part_data)
            if prev_part_data.effect_id != -1:
                effect_id = prev_part_data.effect_id

            prev_index -= 1

        if effect_id == -1:
            raise Exception("There is not previous effect to reference.")

    # effect mode
    if effect_id != 0:
        alpha = part_data.alpha
        effect = state.led_effect_id_table[part_data.effect_id]
        effect_rgb = [cast(RGB, bulb.rgb) for bulb in effect.effect]
        effect_rgba = [(*bulb_rgb, alpha) for bulb_rgb in effect_rgb]
        actual_effect_rgb = [to_actual_rgb(rgba) for rgba in effect_rgba]
        flattened_color_list.append(actual_effect_rgb)
    # single bulb mode
    else:
        effect = state.led_effect_id_table[part_data.effect_id]
        actual_effect_rgb: list[ActualRGB] = []
        num_to_be_interpolate = 0
        last_actual_rgb_color: ActualRGB | None = None
        for bulb in effect.effect:
            # has color
            if bulb.color_id != -1:
                rgba = (*cast(RGB, bulb.rgb), bulb.alpha)

                if last_actual_rgb_color is not None:
                    gradient_interpolate(
                        last_actual_rgb_color,
                        rgba,
                        num_to_be_interpolate,
                        actual_effect_rgb,
                    )

                actual_rgb = to_actual_rgb(rgba)
                num_to_ben_interpolate = 0
                last_actual_rgb_color = actual_rgb
                actual_effect_rgb.append(actual_rgb)
            # waiting for interpolation
            else:
                if last_actual_rgb_color is None:
                    actual_effect_rgb.append((0.0, 0.0, 0.0))
                    last_actual_rgb_color = (0.0, 0.0, 0.0)
                else:
                    num_to_be_interpolate += 1
                    last_actual_rgb_color = actual_effect_rgb[-1]

        if num_to_be_interpolate > 0:
            last_actual_rgb_color = cast(ActualRGB, last_actual_rgb_color)
            gradient_interpolate(
                last_actual_rgb_color,
                (0, 0, 0, 0),
                num_to_be_interpolate - 1,
                actual_effect_rgb,
            )
            actual_effect_rgb.append((0.0, 0.0, 0.0))
        flattened_color_list.append(actual_effect_rgb)


def ctrl_is_arithmetic_sequence(control_history: CtrlHistory):
    EPSILON = 1e-4
    last_control = control_history[-3:]
    control_list = [control[2] for control in last_control]
    frame_list = [control[1] for control in last_control]

    flattened_color_list: list[ActualRGB] | list[list[ActualRGB]] = []

    for fake_index, control in enumerate(control_list):
        true_index = len(control_history) - 3 + fake_index
        # FiberData
        if isinstance(control.part_data, FiberData):
            flattened_color_list = cast(list[ActualRGB], flattened_color_list)
            rgb = state.color_map[control.part_data.color_id].rgb
            rgba = *rgb, control.part_data.alpha
            actual_rgb = to_actual_rgb(rgba)
            flattened_color_list.append(actual_rgb)
        # LEDData
        else:
            flattened_color_list = cast(list[list[ActualRGB]], flattened_color_list)
            part_data = cast(LEDData, control.part_data)

            handle_effect(part_data, flattened_color_list, control_history, true_index)

    for prim_color_index in range(3):
        # list[ActualRGB]
        if isinstance(flattened_color_list[0], tuple):
            flattened_color_list = cast(list[ActualRGB], flattened_color_list)

            left_handside = (
                flattened_color_list[1][prim_color_index]
                - flattened_color_list[0][prim_color_index]
            ) * float(frame_list[2] - frame_list[1])
            right_handside = (
                flattened_color_list[2][prim_color_index]
                - flattened_color_list[1][prim_color_index]
            ) * float(frame_list[1] - frame_list[0])

            if abs(left_handside - right_handside) > EPSILON:
                return False
        # list[list[ActualRGB]]
        else:
            flattened_color_list = cast(list[list[ActualRGB]], flattened_color_list)

            for bulb_index in range(len(flattened_color_list[0])):
                left_handside = (
                    flattened_color_list[1][bulb_index][prim_color_index]
                    - flattened_color_list[0][bulb_index][prim_color_index]
                ) * float(frame_list[2] - frame_list[1])
                right_handside = (
                    flattened_color_list[2][bulb_index][prim_color_index]
                    - flattened_color_list[1][bulb_index][prim_color_index]
                ) * float(frame_list[1] - frame_list[0])

                if abs(left_handside - right_handside) > EPSILON:
                    return False

        return True


def pos_is_arithmetic_sequence(position_history: PosHistory):
    EPSILON = 0.1
    last_position = position_history[-3:]
    position_list = [position[2] for position in last_position]
    frame_list = [position[1] for position in last_position]

    # dict[str, int] is [x, y, z, rx, ry, rz]
    flattened_position_list: list[dict[str, int]] = []
    for position in position_list:
        flattened_location = position.location.__dict__
        flattened_rotation = position.rotation.__dict__
        flattened_position = {**flattened_location, **flattened_rotation}
        flattened_position_list.append(flattened_position)

    for attr in ["x", "y", "z", "rx", "ry", "rz"]:
        left_handside = (
            flattened_position_list[1][attr] - flattened_position_list[0][attr]
        ) * float(frame_list[2] - frame_list[1])
        right_handside = (
            flattened_position_list[2][attr] - flattened_position_list[1][attr]
        ) * float(frame_list[1] - frame_list[0])
        if abs(left_handside - right_handside) > EPSILON:
            return False
    return True


def control_of_dancer(
    control_map: ControlMapMODIFIED, dancer: DancerName, part: PartName, mapID: MapID
) -> PartAndLEDData | None:
    return control_map[mapID].status[dancer][part]


# One-to-one transform without care of has_effect
def rough_conv_control_status_to_old(
    old_control_map_element: ControlMapElement,
) -> ControlMapStatusMODIFIED:
    control_map_status = {}
    for dancer, part_list in state.dancers.items():
        dancer_map = {}
        for part in part_list:
            part_data = old_control_map_element.status[dancer][part]
            bulb_data = old_control_map_element.led_status[dancer][part]
            dancer_map[part] = PartAndLEDData(part_data=part_data, bulb_data=bulb_data)
        control_map_status[dancer] = dancer_map
    return control_map_status


# One-to-one transform without care of has_effect
def rough_conv_control_map_to_old():
    state.control_mapMODIFIED = {}
    deepcopy_control_map_items = deepcopy(state.control_map).items()
    for mapID, control_map_element in deepcopy_control_map_items:
        control_map_status = rough_conv_control_status_to_old(control_map_element)
        control_map_element_status = ControlMapElementMODIFIED(
            start=control_map_element.start,
            fade=control_map_element.fade,
            rev=control_map_element.rev,
            status=control_map_status,
        )
        state.control_mapMODIFIED[mapID] = control_map_element_status


# def conv_control_map_to_new():
#     pass

# #Override state.pos_mapMODIFIED to state.pos_map
# def conv_pos_map_to_new():
#     state.pos_map = deepcopy(state.pos_mapMODIFIED)
#     NumberofPosFrame = len(state.pos_map)
#     for dancer in state.dancer_names:
#         last_position: tuple[MapID, int, PosMapPosition] | None = None
#         no_effect_position_history: PosHistory = []
#         for mapID in range(0, NumberofPosFrame):
#             frame_number = state.pos_map[mapID].start
#             pos_of_dancer = position_of_dancer(state.pos_map, dancer, mapID)

#             if last_position is None:
#                 if not pos_of_dancer.has_effect:
#                     empty_position = Position(
#                         location=Location(x=0, y=0, z=0),
#                         rotation=Rotation(rx=0, ry=0, rz=0),
#                         has_effect=True
#                     )
#                     last_position = 0, 0, empty_position
#                     pos_of_dancer.has_effect = True
#                     pos_of_dancer.location = Location(x=0, y=0, z=0)
#                     pos_of_dancer.rotation = Rotation(rx=0, ry=0, rz=0)
#                 else:
#                     last_position = mapID, frame_number, pos_of_dancer
#                 continue

#             if not pos_of_dancer.has_effect:
#                 this_position = mapID, frame_number, pos_of_dancer
#                 no_effect_position_history.append(this_position)
#                 continue

#             if no_effect_position_history:
#                 for _, ne_frame_number, ne_pos_of_dancer in no_effect_position_history:
#                     position_interpolate([last_position[2], pos_of_dancer], [last_position[1], frame_number], ne_frame_number, ne_pos_of_dancer)
#                 no_effect_position_history.clear()

# # Override state.control_map to state.control_mapMODIFIED
# def conv_control_map_to_old():
#     rough_conv_control_map_to_old()
#     NumberOfPosFrame = len(state.control_mapMODIFIED)
#     for dancer, part_list in state.dancers.items():
#         for part in part_list:
#             control_history: CtrlHistory = []
#             for mapID in range(0, NumberOfPosFrame):
#                 frame_number = state.control_mapMODIFIED[mapID].start
#                 ctrl_of_dancer = control_of_dancer(state.control_mapMODIFIED, dancer, part, mapID)

#                 this_control = mapID, frame_number, ctrl_of_dancer
#                 control_history.append(this_control)
#                 if len(control_history) < 3:
#                     continue

#                 if ctrl_is_arithmetic_sequence(control_history):
#                     mid_ctrl_of_dancer = control_history[-2][2]
#                     mid_ctrl_of_dancer.has_effect = False
#                     control_history.pop(-2)


# Override state.pos_map to state.pos_mapMODIFIED
def conv_pos_map_to_old():
    state.pos_mapMODIFIED = deepcopy(state.pos_map)
    pos_map = state.pos_map
    sorted_pos_map = sorted(pos_map.items(), key=lambda item: item[1].start)
    for dancer in state.dancer_names:
        position_history: PosHistory = []
        for mapID, pos_map_elem in sorted_pos_map:
            start = pos_map_elem.start
            pos_of_dancer = pos_map_elem.pos[dancer]
            pos_of_dancer = cast(Position, pos_of_dancer)

            this_position = mapID, start, pos_of_dancer
            position_history.append(this_position)
            if len(position_history) < 3:
                continue

            if pos_is_arithmetic_sequence(position_history):
                deletable_dancer_mapID = position_history[-2][0]
                state.pos_mapMODIFIED[deletable_dancer_mapID].pos[dancer] = None
                position_history.pop(-2)
