from typing import List, Tuple

from ...graphqls.queries import (
    QueryColorMapPayload,
    QueryControlFrame,
    QueryControlMapPayload,
    QueryCoordinatesPayload,
    QueryDancersPayload,
    QueryDancerStatusPayload,
    QueryDancerStatusPayloadItem,
    QueryEffectListControlFrame,
    QueryEffectListItem,
    QueryEffectListPositionFrame,
    QueryPosFrame,
    QueryPosMapPayload,
)
from ...graphqls.subscriptions import (
    SubControlFrame,
    SubEffectListItemData,
    SubPositionFrame,
)
from ..models import (
    Color,
    ColorMap,
    ControlMap,
    ControlMapElement,
    ControlMapStatus,
    DancersArray,
    DancersArrayItem,
    DancersArrayPartsItem,
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


def pos_frame_sub_to_query(data: SubPositionFrame) -> QueryPosFrame:
    response = QueryPosFrame(start=data.start, pos=[])

    response.pos = [(pos[0], pos[1], pos[2]) for pos in data.pos]

    return response


def coordinates_query_to_state(payload: QueryCoordinatesPayload) -> Location:
    return Location(x=payload[0], y=payload[1], z=payload[2])


def pos_status_query_to_state(payload: List[QueryCoordinatesPayload]) -> PosMapStatus:
    pos_map_status: PosMapStatus = {}

    for dancerIndex, dancerStatus in enumerate(payload):
        dancers_array_item = state.dancers_array[dancerIndex]
        dancer_name = dancers_array_item.name

        pos_map_status[dancer_name] = coordinates_query_to_state(dancerStatus)

    return pos_map_status


def pos_map_query_to_state(frames: QueryPosMapPayload) -> PosMap:
    pos_map: PosMap = {}

    for id, frame in frames.items():
        pos_map[id] = PosMapElement(
            start=frame.start, pos=pos_status_query_to_state(frame.pos)
        )

    return pos_map


def part_data_query_to_state(
    part_type: PartType, payload: QueryDancerStatusPayloadItem
) -> PartData:
    match part_type:
        case PartType.LED:
            return LEDData(effect_id=payload[0], alpha=payload[1])
        case PartType.FIBER:
            return FiberData(color_id=payload[0], alpha=payload[1])


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


def control_map_query_to_state(frames: QueryControlMapPayload) -> ControlMap:
    control_map: ControlMap = {}

    for id, frame in frames.items():
        control_map_element = ControlMapElement(
            start=frame.start, fade=frame.fade, status={}
        )

        control_map_element.status = control_status_query_to_state(frame.status)

        control_map[id] = control_map_element

    return control_map


def control_frame_sub_to_query(data: SubControlFrame) -> QueryControlFrame:
    response = QueryControlFrame(start=data.start, fade=data.fade, status=[])

    response.status = [
        [(partControl[0], partControl[1]) for partControl in partControls]
        for partControls in data.status
    ]

    return response


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    r, g, b = rgb
    return f"#{r:02x}{g:02x}{b:02x}"


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


def rgb_to_float(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    return tuple([i / 255 for i in rgb])  # type: ignore


def float_to_rgb(color_float: Tuple[float, float, float]) -> tuple[int, int, int]:
    return tuple([round(i * 255) for i in color_float])  # type: ignore
