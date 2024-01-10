from typing import List, Tuple

from ...graphqls.queries import (
    QueryColorMapData,
    QueryColorMapPayload,
    QueryControlFrame,
    QueryControlMapData,
    QueryCoordinatesPayload,
    QueryDancerStatusPayload,
    QueryDancerStatusPayloadItem,
    QueryPosFrame,
    QueryPosMapData,
)
from ...graphqls.subscriptions import SubControlFrame, SubPositionFrame
from ..models import (
    Color,
    ColorMap,
    ControlMap,
    ControlMapElement,
    ControlMapStatus,
    DancerStatus,
    FiberData,
    LEDData,
    Location,
    PartData,
    PartType,
    PosMap,
    PosMapElement,
    PosMapStatus,
)
from ..states import state


# WARNING: Untested
def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    r, g, b = rgb
    return f"#{r:02x}{g:02x}{b:02x}"


# WARNING: Untested
def pos_frame_sub_to_query(data: SubPositionFrame) -> QueryPosFrame:
    response = QueryPosFrame(start=data.start, pos=[])

    response.pos = list(map(lambda pos: (pos[0], pos[1], pos[2]), data.pos))

    return response


# WARNING: Untested
def coordinates_query_to_state(payload: QueryCoordinatesPayload) -> Location:
    return Location(x=payload[0], y=payload[1], z=payload[2])


# WARNING: Untested
def pos_status_query_to_state(payload: List[QueryCoordinatesPayload]) -> PosMapStatus:
    pos_map_status: PosMapStatus = {}

    for dancerIndex, dancerStatus in enumerate(payload):
        dancers_array_item = state.dancers_array[dancerIndex]
        dancer_name = dancers_array_item.name

        pos_map_status[dancer_name] = coordinates_query_to_state(dancerStatus)

    return pos_map_status


# WARNING: Untested
def pos_map_query_to_state(response: QueryPosMapData) -> PosMap:
    frames = response.frameIds

    pos_map: PosMap = {}

    for id, frame in frames.items():
        pos_map[id] = PosMapElement(
            start=frame.start, pos=pos_status_query_to_state(frame.pos)
        )

    return pos_map


# WARNING: Untested
def part_data_query_to_state(
    part_type: PartType, payload: QueryDancerStatusPayloadItem
) -> PartData:
    match part_type:
        case PartType.LED:
            return LEDData(effect_id=payload[0], alpha=payload[1])
        case PartType.FIBER:
            return FiberData(color_id=payload[0], alpha=payload[1])


# WARNING: Untested
def control_status_query_to_state(
    payload: List[QueryDancerStatusPayload],
) -> ControlMapStatus:
    control_map_status: ControlMapStatus = {}

    for dancerIndex, dancerStatus in enumerate(payload):
        dancers_array_item = state.dancers_array[dancerIndex]
        dancer_name = dancers_array_item.name
        dancer_parts = dancers_array_item.parts
        dancer_status: DancerStatus = {}

        for partIndex, partStatus in enumerate(dancerStatus):
            part_name = dancer_parts[partIndex].name
            part_type = state.part_type_map[part_name]

            dancer_status[part_name] = part_data_query_to_state(part_type, partStatus)

        control_map_status[dancer_name] = dancer_status

    return control_map_status


# WARNING: Untested
def control_map_query_to_state(response: QueryControlMapData) -> ControlMap:
    frames = response.frameIds

    control_map: ControlMap = {}

    for id, frame in frames.items():
        control_map_element = ControlMapElement(
            start=frame.start, fade=frame.fade, status={}
        )

        control_map_element.status = control_status_query_to_state(frame.status)

        control_map[id] = control_map_element

    return control_map


# WARNING: Untested
def control_frame_sub_to_query(data: SubControlFrame) -> QueryControlFrame:
    response = QueryControlFrame(start=data.start, fade=data.fade, status=[])

    response.status = list(
        map(
            lambda partControls: list(
                map(lambda partControl: (partControl[0], partControl[1]), partControls)
            ),
            data.status,
        )
    )

    return response


# WARNING: Untested
def color_map_query_to_state(response: QueryColorMapData) -> ColorMap:
    payload: QueryColorMapPayload = response.colorMap

    color_map: ColorMap = {}

    for id, color in payload.items():
        color_map[id] = Color(
            id=id,
            name=color.color,
            color_code=rgb_to_hex(color.colorCode),
            rgb=color.colorCode,
        )

    return color_map
