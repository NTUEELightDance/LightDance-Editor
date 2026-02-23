from typing import cast

from ...schemas.mutations import (
    MutDancerFade,
    MutDancerHasEffect,
    MutDancerLEDStatusPayload,
    MutDancerStatusPayload,
)
from ...schemas.queries import (
    QueryColorMapPayload,
    QueryColorMapPayloadItem,
    QueryControlFrame,
    QueryControlMapPayload,
    QueryCoordinatesPayload,
    QueryDancerLEDBulbStatusPayload,
    QueryDancersPayload,
    QueryDancerStatusPayload,
    QueryDancerStatusPayloadItem,
    QueryEffectListControlFrame,
    QueryEffectListItem,
    QueryEffectListPositionFrame,
    QueryLEDBulbDataPayload,
    QueryLEDMapPayload,
    QueryModelPayload,
    QueryPosFrame,
    QueryPosMapPayload,
    QueryRevision,
)
from ...schemas.subscriptions import (
    SubControlFrame,
    SubEffectListItemData,
    SubLEDRecordDataItem,
    SubPositionFrame,
)
from ..models import (
    RGB,
    Color,
    ColorID,
    ColorMap,
    ControlMap_MODIFIED,
    ControlMapElement_MODIFIED,
    ControlMapStatus_MODIFIED,
    CtrlData,
    DancerName,
    DancersArray,
    DancersArrayItem,
    DancersArrayPartsItem,
    DancerStatus_MODIFIED,
    FiberData,
    LEDBulbData,
    LEDData,
    LEDEffect,
    LEDEffectID,
    LEDMap,
    Location,
    MapID,
    ModelsArray,
    ModelsArrayItem,
    PartData,
    PartName,
    PartType,
    Position,
    PosMap,
    PosMapElement,
    PosMapStatus,
    Revision,
    Rotation,
)
from ..states import state
from ..utils.algorithms import (
    binary_search,
    expanded_filtered_map_bound,
    smallest_range_including_lr,
)


def models_query_to_state(payload: QueryModelPayload) -> ModelsArray:
    models_array = [
        ModelsArrayItem(name=model.name, dancers=model.dancers) for model in payload
    ]

    return models_array


def dancers_query_to_state(payload: QueryDancersPayload) -> DancersArray:
    dancers_array: DancersArray = []

    for dancer in payload:
        dancerName = dancer.name
        dancerParts = dancer.parts
        dancers_array_item = DancersArrayItem(name=dancerName, parts=[])

        for part in dancerParts:
            dancers_array_item.parts.append(
                DancersArrayPartsItem(
                    name=part.name, type=part.type, length=part.length
                )
            )

        dancers_array.append(dancers_array_item)

    return dancers_array


def pos_frame_query_to_state(payload: QueryPosFrame) -> PosMapElement:
    rev = Revision(meta=payload.rev.meta, data=payload.rev.data)

    pos_map_element = PosMapElement(start=payload.start, pos={}, rev=rev)
    pos_map_element.pos = pos_status_query_to_state(
        payload.location, payload.rotation, payload.has_position
    )

    return pos_map_element


def pos_frame_sub_to_query(data: SubPositionFrame) -> QueryPosFrame:
    rev = QueryRevision(meta=data.rev.meta, data=data.rev.data)

    response = QueryPosFrame(
        start=data.start,
        location=[],
        rotation=[],
        rev=rev,
        has_position=data.has_position,
    )

    response.location = [(loc[0], loc[1], loc[2]) for loc in data.location]
    response.rotation = [(rot[0], rot[1], rot[2]) for rot in data.rotation]

    return response


def coordinates_query_to_state(
    loc_payload: QueryCoordinatesPayload, rot_payload: QueryCoordinatesPayload
) -> Position:
    return Position(
        Location(x=loc_payload[0], y=loc_payload[1], z=loc_payload[2]),
        rotation=Rotation(rx=rot_payload[0], ry=rot_payload[1], rz=rot_payload[2]),
    )


def pos_status_query_to_state(
    loc_payload: list[QueryCoordinatesPayload],
    rot_payload: list[QueryCoordinatesPayload],
    has_effect_payload: list[bool],
) -> PosMapStatus:
    pos_map_status: PosMapStatus = {}
    for dancerIndex, (
        dancerLocStatus,
        dancerRotStatus,
        dancerHasEffectStatus,
    ) in enumerate(zip(loc_payload, rot_payload, has_effect_payload)):
        dancers_array_item = state.dancers_array[dancerIndex]
        dancer_name = dancers_array_item.name

        if dancerHasEffectStatus:
            pos_map_status[dancer_name] = coordinates_query_to_state(
                dancerLocStatus, dancerRotStatus
            )
        else:
            pos_map_status[dancer_name] = None

    return pos_map_status


def pos_map_query_to_state(frames: QueryPosMapPayload) -> PosMap:
    pos_map: PosMap = {}

    for id, frame in frames.items():
        pos_map[id] = pos_frame_query_to_state(frame)

    return pos_map


def part_data_query_to_state(
    part_type: PartType, payload: QueryDancerStatusPayloadItem
) -> PartData:
    match part_type:
        case PartType.LED:
            return LEDData(effect_id=payload[0], alpha=payload[1])
        case PartType.FIBER:
            return FiberData(color_id=payload[0], alpha=payload[1])


def part_led_data_query_to_state(payload: QueryLEDBulbDataPayload) -> list[LEDBulbData]:
    return [LEDBulbData(color_id=bulb[0], alpha=bulb[1]) for bulb in payload]


def part_data_state_to_mut(
    part_ctrl_data: CtrlData | None,
) -> tuple[LEDEffectID | ColorID, int]:
    if part_ctrl_data is None:
        return (0, 0)  # Only a placeholder

    part_data = part_ctrl_data.part_data
    if isinstance(part_data, LEDData):
        return (part_data.effect_id, part_data.alpha)
    else:
        return (part_data.color_id, part_data.alpha)


def part_led_data_state_to_mut(
    part_ctrl_data: CtrlData | None,
) -> list[tuple[ColorID, int]]:
    if part_ctrl_data is None:
        return []  # Only a placeholder

    led_data = part_ctrl_data.bulb_data
    return [(bulb.color_id, bulb.alpha) for bulb in led_data]


def control_status_query_to_state(
    status_payload: list[QueryDancerStatusPayload],
    led_status_payload: list[QueryDancerLEDBulbStatusPayload],
    fade_payload: list[MutDancerFade],
    has_effect_payload: list[MutDancerHasEffect],
) -> ControlMapStatus_MODIFIED:
    control_map_status: ControlMapStatus_MODIFIED = {}

    for dancerIndex, dancerStatus in enumerate(status_payload):
        dancers_array_item = state.dancers_array[dancerIndex]
        dancer_name = dancers_array_item.name
        dancer_parts = dancers_array_item.parts
        dancer_status: DancerStatus_MODIFIED = {}

        dancerLEDStatus = led_status_payload[dancerIndex]
        fadeStatus = fade_payload[dancerIndex]
        hasEffectStatus = has_effect_payload[dancerIndex]

        for partIndex, partStatus in enumerate(dancerStatus):
            part_name = dancer_parts[partIndex].name
            part_type = state.part_type_map[part_name]

            partLEDStatus = dancerLEDStatus[partIndex]

            if not hasEffectStatus:
                dancer_status[part_name] = None
                continue

            part_status = part_data_query_to_state(part_type, partStatus)
            part_led_status = part_led_data_query_to_state(partLEDStatus)
            dancer_status[part_name] = CtrlData(
                part_data=part_status, bulb_data=part_led_status, fade=fadeStatus
            )

        control_map_status[dancer_name] = dancer_status

    return control_map_status


# def led_status_query_to_state(
#     payload: list[QueryDancerLEDBulbStatusPayload],
# ) -> ControlMapLEDStatus:
#     control_map_led_status: ControlMapLEDStatus = {}

#     for dancerIndex, dancerStatus in enumerate(payload):
#         dancers_array_item = state.dancers_array[dancerIndex]
#         dancer_name = dancers_array_item.name
#         dancer_parts = dancers_array_item.parts
#         dancer_status: DancerLEDStatus = {}

#         for partIndex, partStatus in enumerate(dancerStatus):
#             part_name = dancer_parts[partIndex].name
#             part_type = state.part_type_map[part_name]

#             dancer_status[part_name] = part_led_data_query_to_state(partStatus)

#         control_map_led_status[dancer_name] = dancer_status

#     return control_map_led_status


def control_frame_query_to_state(
    payload: QueryControlFrame,
) -> ControlMapElement_MODIFIED:
    rev = Revision(meta=payload.rev.meta, data=payload.rev.data)

    control_map_element = ControlMapElement_MODIFIED(
        start=payload.start, status={}, rev=rev, fade_for_new_status=False
    )

    control_map_element.status = control_status_query_to_state(
        payload.status, payload.led_status, payload.fade, payload.has_effect
    )

    return control_map_element


def control_map_query_to_state(frames: QueryControlMapPayload) -> ControlMap_MODIFIED:
    control_map: ControlMap_MODIFIED = {}

    for id, frame in frames.items():
        control_map[id] = control_frame_query_to_state(frame)

    return control_map


def control_frame_sub_to_query(data: SubControlFrame) -> QueryControlFrame:
    rev = QueryRevision(meta=data.rev.meta, data=data.rev.data)

    response = QueryControlFrame(
        start=data.start,
        fade=data.fade,
        status=[],
        led_status=[],
        rev=rev,
        has_effect=data.has_effect,
    )

    response.status = [
        [(partControl[0], partControl[1]) for partControl in partControls]
        for partControls in data.status
    ]
    response.led_status = [
        [
            [(control[0], control[1]) for control in partControl]
            for partControl in partLEDBulbControls
        ]
        for partLEDBulbControls in data.led_status
    ]

    return response


def control_status_state_to_mut(
    control_status: ControlMapStatus_MODIFIED,
) -> tuple[
    list[MutDancerHasEffect],
    list[MutDancerFade],
    list[MutDancerStatusPayload],
    list[MutDancerLEDStatusPayload],
]:
    mut_dancer_has_effect_payload: list[MutDancerHasEffect] = []
    mut_dancer_fade_payload: list[MutDancerFade] = []
    mut_dancer_status_payload: list[MutDancerStatusPayload] = []
    mut_dancer_led_status_payload: list[MutDancerLEDStatusPayload] = []

    for dancer in state.dancers_array:
        dancer_name = dancer.name
        first_part_name = dancer.parts[0].name

        dancer_status = control_status.get(dancer_name)
        if dancer_status is None:
            raise Exception("Dancer status not found")

        mut_dancer_has_effect_payload.append(dancer_status[first_part_name] is not None)
        mut_dancer_fade_payload.append(
            False
            if dancer_status[first_part_name] is None
            else dancer_status[first_part_name].fade  # type: ignore
        )
        mut_dancer_status_payload.append(
            [part_data_state_to_mut(dancer_status[part.name]) for part in dancer.parts]
        )
        mut_dancer_led_status_payload.append(
            [
                part_led_data_state_to_mut(dancer_status[part.name])
                for part in dancer.parts
            ]
        )
    return (
        mut_dancer_has_effect_payload,
        mut_dancer_fade_payload,
        mut_dancer_status_payload,
        mut_dancer_led_status_payload,
    )


# def led_status_state_to_mut(
#     led_status: ControlMapLEDStatus,
# ) -> list[MutDancerLEDStatusPayload]:
#     mut_dancer_status_payload: list[MutDancerLEDStatusPayload] = []

#     for dancer in state.dancers_array:
#         dancer_name = dancer.name
#         dancer_status = led_status.get(dancer_name)
#         if dancer_status is None:
#             raise Exception("Dancer LED status not found")

#         mut_dancer_status_payload.append(
#             [
#                 part_led_data_state_to_mut(dancer_status[part.name])
#                 for part in dancer.parts
#             ]
#         )

#     return mut_dancer_status_payload


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    r, g, b = rgb
    return f"#{r:02x}{g:02x}{b:02x}"


def color_query_to_state(id: ColorID, payload: QueryColorMapPayloadItem) -> Color:
    return Color(
        id=id,
        name=payload.color,
        color_code=rgb_to_hex(payload.colorCode),
        rgb=payload.colorCode,
    )


def color_map_query_to_state(payload: QueryColorMapPayload) -> ColorMap:
    color_map: ColorMap = {}

    for id, color in payload.items():
        color_map[id] = Color(
            id=id,
            name=color.color,
            color_code=rgb_to_hex(color.colorCode),
            rgb=color.colorCode,
        )

    return color_map


def led_map_query_to_state(payload: QueryLEDMapPayload) -> LEDMap:
    led_map: LEDMap = {}

    for model_name, parts in payload.items():
        led_map[model_name] = {}
        model_map = led_map[model_name]

        for part_name, effects in parts.items():
            model_map[part_name] = {}
            part_map = model_map[part_name]

            for effect_name, effect in effects.items():
                frame = effect.frames[0]
                bulb_data = [
                    LEDBulbData(color_id=color_id, alpha=alpha)
                    for color_id, alpha in frame.LEDs
                ]
                part_map[effect_name] = LEDEffect(
                    id=effect.id, name=effect_name, effect=bulb_data
                )

    return led_map


# WARNING: Untested
def effect_list_data_sub_to_query(data: SubEffectListItemData) -> QueryEffectListItem:
    effectListItem = QueryEffectListItem(
        start=data.start,
        end=data.end,
        description=data.description,
        id=data.id,
        controlFrames=[],
        positionFrames=[],
    )

    effectListItem.controlFrames = [
        QueryEffectListControlFrame(
            id=controlFrame.id, start=controlFrame.start, fade=controlFrame.fade
        )
        for controlFrame in data.controlFrames
    ]
    effectListItem.positionFrames = [
        QueryEffectListPositionFrame(id=positionFrame.id, start=positionFrame.start)
        for positionFrame in data.positionFrames
    ]

    return effectListItem


def led_record_sub_to_state_item(led_payload_item: SubLEDRecordDataItem) -> LEDEffect:
    effect = [
        LEDBulbData(color_id=bulb[0], alpha=bulb[1])
        for bulb in led_payload_item.frames[0].LEDs
    ]
    return LEDEffect(id=led_payload_item.id, name=led_payload_item.name, effect=effect)


def rgb_to_float(rgb: tuple[int, ...]) -> tuple[float, ...]:
    return tuple([color / 255 for color in rgb])


def float_to_rgb(color_float: tuple[float, ...]) -> tuple[int, ...]:
    return tuple([round(color * 255) for color in color_float])


def rgba_to_float(rgb: tuple[int, ...] | list[int], a: int) -> tuple[float, ...]:
    r, g, b = rgb
    a_float = a / 255
    return (
        r / 255 * a_float,
        g / 255 * a_float,
        b / 255 * a_float,
    )


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
            return [(0.0, 0.0, 0.0)] * (length + 2)  # No color specified, return black
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


def gradient_to_rgb_float(
    bulb_sequence: list[tuple[ColorID, int]],
) -> list[tuple[float, ...]]:
    """
    Cut LED bulb sequence into segments and interpolate gradient for color_id=-1.
    NOTE: The segments are sliced while preserving head and tail.
    e.g. Color ID : `-1, 1, -1, -1, 2, 3 -> [[-1, 1], [1], [1, -1, -1, 2], [2], [3]]`
    """
    segments: list[list[tuple[ColorID, int]]] = []
    head = 0
    for i, bulb_status in enumerate(bulb_sequence):
        if bulb_status[0] == -1 and i != len(bulb_sequence) - 1:
            continue
        elif (i != 0 and bulb_sequence[i - 1][0] == -1) or i == len(bulb_sequence) - 1:
            segments.append(bulb_sequence[head : i + 1])
            head = i
        if bulb_status[0] != -1:
            segments.append([bulb_status])
            head = i

    free_l, free_r = bulb_sequence[0][0] == -1, bulb_sequence[-1][0] == -1
    if free_l or free_r:
        offset = len(segments[-1]) - 1
        segments = [[*(segments[-1]), *(segments[0])]] + segments[
            (1 if free_l else 0) : (-1 if free_r else len(segments))
        ]
    else:
        offset = 0

    rgb_float_list: list[tuple[float, ...]] = []
    for segment in segments:
        rgb_float_list.extend(interpolate_gradient(segment))
    rgb_float_list = rgb_float_list[offset:] + rgb_float_list[:offset]
    return rgb_float_list


def is_color_code(color_code: str) -> bool:
    if len(color_code) != 7:
        return False
    if color_code[0] != "#":
        return False
    for char in color_code[1:8]:
        if char not in "1234567890abcdef":
            return False
    return True


def frame_to_time(frame: int) -> str:
    milliseconds = frame
    seconds = milliseconds // 1000
    minutes = seconds // 60
    return f"{minutes:02}:{seconds % 60:02}:{milliseconds % 1000:03}"


def time_to_frame(time: str) -> int:
    splits = time.split(":")
    if len(splits) != 3:
        return -1

    minutes = int(splits[0])
    seconds = int(splits[1])
    milliseconds = int(splits[2])

    return (minutes * 60 + seconds) * 1000 + milliseconds


def csv_second_to_miliseconds(second: str) -> int:
    return int(float(second) * 1000)


PositionData = tuple[float, float, float]
RotationData = tuple[float, float, float]
LocationData = tuple[PositionData, RotationData]
PosDeleteCurveData = list[int]
PosUpdateCurveData = list[tuple[int, int, LocationData | None]]
PosAddCurveData = list[tuple[int, LocationData | None]]

PosModifyAnimationData = dict[
    DancerName, tuple[PosDeleteCurveData, PosUpdateCurveData, PosAddCurveData]
]


def pos_modify_to_animation_data(
    pos_delete: list[tuple[int, MapID]],
    pos_update: list[tuple[int, MapID, PosMapElement]],
    pos_add: list[tuple[MapID, PosMapElement]],
) -> PosModifyAnimationData:
    new_map: PosModifyAnimationData = {}

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))

    for dancer in state.dancers_array:
        if not show_dancer_dict[dancer.name]:
            continue
        new_map[dancer.name] = ([], [], [])

    for old_start, id in pos_delete:
        # Get the original frame to find which dancers have position data
        original_frame = state.pos_map_MODIFIED.get(id)
        if original_frame:
            for dancer_item in state.dancers_array:
                if not show_dancer_dict[dancer_item.name]:
                    continue
                if original_frame.pos[dancer_item.name] is None:
                    continue
                dancer = dancer_item.name
                new_map[dancer][0].append(old_start)
        else:
            for _, dancer_item in enumerate(state.dancers_array):
                if not show_dancer_dict[dancer_item.name]:
                    continue
                dancer = dancer_item.name
                new_map[dancer][0].append(old_start)

    for old_start, mapID, frame in pos_update:
        pos_status = frame.pos
        # Get the old frame to compare if data has actually changed
        old_frame_id = mapID

        old_pos_status = (
            state.pos_map_MODIFIED.get(old_frame_id).pos if old_frame_id else {}  # type: ignore
        )

        for _, dancer_item in enumerate(state.dancers_array):
            if not show_dancer_dict[dancer_item.name]:
                continue
            pos = pos_status[dancer_item.name]
            old_pos = old_pos_status.get(dancer_item.name) if old_frame_id else None
            dancer = dancer_item.name

            # Only add update if the position data has actually changed

            if pos is None and old_pos is None:
                continue
            elif pos is None and old_pos is not None:
                new_map[dancer][1].append((old_start, frame.start, None))
            elif pos is not None and old_pos is None:
                location = (pos.location.x, pos.location.y, pos.location.z)
                rotation = (pos.rotation.rx, pos.rotation.ry, pos.rotation.rz)
                new_map[dancer][1].append(
                    (
                        old_start,
                        frame.start,
                        (location, rotation),
                    )
                )
            else:
                pos = cast(Position, pos)
                old_pos = cast(Position, pos)
                location = (pos.location.x, pos.location.y, pos.location.z)
                rotation = (pos.rotation.rx, pos.rotation.ry, pos.rotation.rz)
                # old_location = (
                #     old_pos.location.x,
                #     old_pos.location.y,
                #     old_pos.location.z,
                # )
                # old_rotation = (
                #     old_pos.rotation.rx,
                #     old_pos.rotation.ry,
                #     old_pos.rotation.rz,
                # )

                # if location != old_location or rotation != old_rotation:
                new_map[dancer][1].append(
                    (
                        old_start,
                        frame.start,
                        (location, rotation),
                    )
                )

    for _, frame in pos_add:
        pos_status = frame.pos
        for _, dancer_item in enumerate(state.dancers_array):
            if not show_dancer_dict[dancer_item.name]:
                continue
            pos = pos_status[dancer_item.name]
            if pos is None:
                continue
            dancer = dancer_item.name

            if pos is None:
                new_map[dancer_item.name][2].append((frame.start, None))
            else:
                new_map[dancer_item.name][2].append(
                    (
                        frame.start,
                        (
                            (pos.location.x, pos.location.y, pos.location.z),
                            (pos.rotation.rx, pos.rotation.ry, pos.rotation.rz),
                        ),
                    )
                )

    return new_map


ControlAnimationData = dict[
    DancerName,
    dict[
        PartName,
        (
            list[tuple[int, bool, tuple[float, float, float]]]
            | list[list[tuple[int, bool, tuple[float, float, float]]]]
        ),
    ],
]

FadeData = bool
ColorData = tuple[float, float, float]
CtrlKeyframeData = tuple[FadeData, ColorData]
ControlDeleteCurveData = list[int]
ControlUpdateCurveData = list[tuple[int, int, CtrlKeyframeData | None]]

# TODO: Delete us
ControlAddCurveData = list[tuple[int, CtrlKeyframeData | None]]

ControlModifyAnimationData = dict[
    DancerName,
    dict[
        PartName,
        (
            tuple[ControlDeleteCurveData, ControlUpdateCurveData, ControlAddCurveData]
            | list[
                tuple[
                    ControlDeleteCurveData, ControlUpdateCurveData, ControlAddCurveData
                ]
            ]
        ),
    ],
]

ControlUpdateAnimationData = dict[
    DancerName,
    dict[
        PartName,
        ControlUpdateCurveData | list[ControlUpdateCurveData],
    ],
]

ControlDeleteAnimationData = dict[
    DancerName,
    dict[PartName, ControlDeleteCurveData | list[ControlDeleteCurveData]],
]

# TODO: Delete us
ControlAddAnimationData = dict[
    DancerName,
    dict[PartName, ControlAddCurveData | list[ControlAddCurveData]],
]


def _upsert(dict, key, val):
    if not val:
        return

    if not isinstance(val, list):
        if key not in dict:
            dict[key] = [val]
        else:
            dict[key].append(val)
    else:
        if key not in dict:
            dict[key] = val
        else:
            dict[key].extend(val)


def _seek_no_change_data(start, dancer_name, part_name) -> list[int]:
    # Not Include Self
    left_index = binary_search(state.control_start_record, start)
    right_index = left_index + 1
    no_change_start_list = []
    while right_index < len(state.control_start_record):
        right_id = state.control_record[right_index]
        check_status = state.control_map_MODIFIED[right_id].status[dancer_name][
            part_name
        ]
        if check_status is None:
            right_index += 1
            continue
        elif isinstance(check_status.part_data, FiberData):
            raise Exception(f"This function should not input FiberData of {part_name}")
        elif check_status.part_data.effect_id == -1:
            no_change_start_list.append(state.control_start_record[right_index])
            right_index += 1
            continue
        else:
            break
    return no_change_start_list


def control_modify_to_animation_data(
    control_delete: list[tuple[int, MapID]],
    control_update: list[tuple[int, MapID, ControlMapElement_MODIFIED]],
    control_add: list[tuple[MapID, ControlMapElement_MODIFIED]],
) -> tuple[ControlModifyAnimationData, dict[str, list[int]]]:
    new_map: ControlModifyAnimationData = {}
    no_change_dict: dict[str, list[int]] = {}

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer_name in state.dancers_array:
        if not show_dancer_dict[dancer_name.name]:
            continue
        new_map[dancer_name.name] = {}
        for part in dancer_name.parts:
            if part.type == PartType.LED:
                length = cast(int, part.length)
                new_map[dancer_name.name][part.name] = [
                    ([], [], []) for _ in range(length)
                ]
            else:
                new_map[dancer_name.name][part.name] = ([], [], [])

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    prev_effect_ids: dict[DancerName, dict[PartName, list[int]]] = {}
    prev_led_status: dict[DancerName, dict[PartName, list[list[tuple[int, int]]]]] = {}

    for old_start, _ in control_delete:
        for dancer_index, dancer_item in enumerate(state.dancers_array):
            dancer_name = dancer_item.name
            if not show_dancer_dict[dancer_name]:
                continue
            parts = dancer_item.parts

            for _, part in enumerate(parts):
                part_name = part.name
                part_map = new_map[dancer_name][part_name]

                if part.type == PartType.LED:
                    part_length = cast(int, part.length)

                    for i in range(part_length):
                        part_map[i][0].append(old_start)  # type: ignore

                    no_change_data = _seek_no_change_data(
                        old_start, dancer_name, part_name
                    )
                    _upsert(
                        no_change_dict, f"{dancer_index}_{part_name}", no_change_data
                    )

                else:
                    part_map[0].append(old_start)  # type: ignore

    for old_start, _, frame in control_update:
        for dancer_index, dancer_item in enumerate(state.dancers_array):
            dancer_name = dancer_item.name
            if not show_dancer_dict[dancer_name]:
                continue

            parts = dancer_item.parts

            for _, part in enumerate(parts):
                part_name = part.name
                part_map = new_map[dancer_name][part_name]
                part_ctrl_data = frame.status[dancer_name][part_name]

                if part_ctrl_data is None:
                    match part.type:
                        case PartType.LED:
                            part_length = cast(int, part.length)

                            for i in range(part_length):
                                part_map[i][1].append((old_start, frame.start, None))  # type: ignore

                            no_change_data = _seek_no_change_data(
                                old_start, dancer_name, part_name
                            )
                            _upsert(
                                no_change_dict,
                                f"{dancer_index}_{part_name}",
                                no_change_data,
                            )
                        case PartType.FIBER:
                            part_map[1].append((old_start, frame.start, None))  # type: ignore
                    continue

                part_status = part_ctrl_data.part_data
                part_led_status = part_ctrl_data.bulb_data
                part_alpha = part_status.alpha

                if isinstance(part_status, LEDData):
                    part_length = cast(int, part.length)

                    led_rgb_floats = []
                    if part_status.effect_id > 0:
                        part_effect = led_effect_table[part_status.effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in part_effect
                        ]
                    elif part_status.effect_id == 0:
                        led_rgb_floats = gradient_to_rgb_float(
                            [
                                (led_data.color_id, led_data.alpha)
                                for led_data in part_led_status
                            ]
                        )
                    else:
                        part_length = state.led_part_length_map[part_name]
                        led_rgb_floats = [(0.0, 0.0, 0.0)] * part_length
                        _upsert(
                            no_change_dict, f"{dancer_index}_{part_name}", frame.start
                        )

                    for i in range(part_length):
                        part_map[i][1].append((old_start, frame.start, (part_ctrl_data.fade, led_rgb_floats[i])))  # type: ignore

                    no_change_data = _seek_no_change_data(
                        old_start, dancer_name, part_name
                    )
                    _upsert(
                        no_change_dict, f"{dancer_index}_{part_name}", no_change_data
                    )
                    no_change_data = _seek_no_change_data(
                        frame.start, dancer_name, part_name
                    )
                    _upsert(
                        no_change_dict, f"{dancer_index}_{part_name}", no_change_data
                    )
                else:
                    part_rgb = color_map[part_status.color_id].rgb
                    fiber_rgb_float = rgba_to_float(part_rgb, part_status.alpha)

                    part_map[1].append((old_start, frame.start, (part_ctrl_data.fade, fiber_rgb_float)))  # type: ignore

    for frame_start, frame in control_add:
        for dancer_index, dancer_item in enumerate(state.dancers_array):
            dancer_name = dancer_item.name
            if not show_dancer_dict[dancer_name]:
                continue

            parts = dancer_item.parts

            for _, part in enumerate(parts):
                part_name = part.name
                part_map = new_map[dancer_name][part_name]
                part_ctrl_data = frame.status[dancer_name][part_name]

                if part_ctrl_data is None:
                    match part.type:
                        case PartType.LED:
                            part_length = cast(int, part.length)

                            for i in range(part_length):
                                part_map[i][2].append((frame.start, None))  # type: ignore

                            no_change_data = _seek_no_change_data(
                                frame_start, dancer_name, part_name
                            )
                            _upsert(
                                no_change_dict,
                                f"{dancer_index}_{part_name}",
                                no_change_data,
                            )

                        case PartType.FIBER:
                            part_map[2].append((frame.start, None))  # type: ignore
                    continue

                part_status = part_ctrl_data.part_data
                part_led_status = part_ctrl_data.bulb_data
                part_alpha = part_status.alpha

                if isinstance(part_status, LEDData):
                    part_length = cast(int, part.length)

                    led_rgb_floats = []
                    if part_status.effect_id > 0:
                        part_effect = led_effect_table[part_status.effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in part_effect
                        ]
                    elif part_status.effect_id == 0:
                        led_rgb_floats = gradient_to_rgb_float(
                            [
                                (led_data.color_id, led_data.alpha)
                                for led_data in part_led_status
                            ]
                        )
                    else:
                        part_length = state.led_part_length_map[part_name]
                        led_rgb_floats = [(0.0, 0.0, 0.0)] * part_length
                        _upsert(no_change_dict, part_name, frame.start)

                    if len(part_map) == 0:
                        part_map.extend([[] for _ in range(part_length)])  # type: ignore

                    for i in range(part_length):
                        part_map[i][2].append((frame.start, (part_ctrl_data.fade, led_rgb_floats[i])))  # type: ignore

                    no_change_data = _seek_no_change_data(
                        frame_start, dancer_name, part_name
                    )
                    _upsert(
                        no_change_dict, f"{dancer_index}_{part_name}", no_change_data
                    )

                else:
                    part_rgb = color_map[part_status.color_id].rgb
                    fiber_rgb_float = rgba_to_float(part_rgb, part_status.alpha)

                    part_map[2].append((frame.start, (part_ctrl_data.fade, fiber_rgb_float)))  # type: ignore

    no_change_data_keys = list(no_change_dict.keys())
    for part_name in no_change_data_keys:
        no_change_dict[part_name] = list(set(no_change_dict[part_name]))
        no_change_dict[part_name].sort()

    return new_map, no_change_dict


def control_map_to_animation_data(
    sorted_control_map: list[tuple[MapID, ControlMapElement_MODIFIED]],
    part_range_dict: dict[PartName, tuple[()] | tuple[int, int]],
) -> ControlAnimationData:
    new_map: ControlAnimationData = {}
    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer_name in state.dancers_array:
        if not show_dancer_dict[dancer_name.name]:
            continue
        new_map[dancer_name.name] = {}
        for part_name in dancer_name.parts:
            new_map[dancer_name.name][part_name.name] = []

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    prev_effect_ids: dict[DancerName, dict[PartName, list[int]]] = {}
    prev_led_status: dict[DancerName, dict[PartName, list[list[tuple[int, int]]]]] = {}

    for mapIndex, (_, frame) in enumerate(sorted_control_map):
        for _, dancer_item in enumerate(state.dancers_array):
            if not show_dancer_dict[dancer_item.name]:
                continue
            dancer_name = dancer_item.name
            parts = dancer_item.parts

            for _, part in enumerate(parts):
                part_name = part.name
                part_map = new_map[dancer_name][part_name]
                part_ctrl_data = frame.status[dancer_name][part_name]

                # If this status is (1) None or (2) out of load range, continue
                load_range = part_range_dict[part_name]
                if not load_range:
                    continue
                load_range_l, load_range_r_closed = load_range
                if (
                    not (load_range_l <= mapIndex <= load_range_r_closed)
                    or part_ctrl_data is None
                ):
                    continue

                part_data = part_ctrl_data.part_data
                part_led_status = part_ctrl_data.bulb_data
                part_fade = part_ctrl_data.fade
                part_alpha = part_data.alpha

                if isinstance(part_data, LEDData):
                    part_length = cast(int, part.length)
                    prev_effect_id = prev_effect_ids.setdefault(
                        dancer_name, {}
                    ).setdefault(part_name, [-1])
                    prev_led_bulbs = prev_led_status.setdefault(
                        dancer_name, {}
                    ).setdefault(part_name, [[]])

                    led_rgb_floats = []
                    if part_data.effect_id > 0:
                        part_effect = led_effect_table[part_data.effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in part_effect
                        ]

                        prev_effect_id[0] = part_data.effect_id

                    elif part_data.effect_id == 0:
                        led_rgb_floats = gradient_to_rgb_float(
                            [
                                (led_data.color_id, led_data.alpha)
                                for led_data in part_led_status
                            ]
                        )
                        prev_effect_id[0] = 0
                        prev_led_bulbs[0] = [
                            (led_data.color_id, led_data.alpha)
                            for led_data in part_led_status
                        ]

                    elif prev_effect_id[0] > 0:
                        prev_effect = led_effect_table[prev_effect_id[0]].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in prev_effect
                        ]

                    elif prev_effect_id[0] == 0:
                        led_rgb_floats = gradient_to_rgb_float(prev_led_bulbs[0])

                    else:
                        led_rgb_floats = [(0, 0, 0)] * part_length

                    if len(part_map) == 0:
                        part_map.extend([[] for _ in range(part_length)])  # type: ignore

                    for i in range(part_length):
                        part_map[i].append((frame.start, part_fade, led_rgb_floats[i]))  # type: ignore

                else:
                    part_rgb = color_map[part_data.color_id].rgb
                    fiber_rgb_float = rgba_to_float(part_rgb, part_data.alpha)

                    part_map.append((frame.start, part_fade, fiber_rgb_float))  # type: ignore

        # print("Frame: ", frame.start)

    return new_map
