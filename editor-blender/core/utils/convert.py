from typing import List, Tuple, Union

from ...graphqls.mutations import MutDancerStatusPayload
from ...graphqls.queries import (
    QueryColorMapPayload,
    QueryColorMapPayloadItem,
    QueryControlFrame,
    QueryControlMapPayload,
    QueryCoordinatesPayload,
    QueryDancersPayload,
    QueryDancerStatusPayload,
    QueryDancerStatusPayloadItem,
    QueryEffectListControlFrame,
    QueryEffectListItem,
    QueryEffectListPositionFrame,
    QueryLEDMapPayload,
    QueryModelPayload,
    QueryPosFrame,
    QueryPosMapPayload,
    QueryRevision,
)
from ...graphqls.subscriptions import (
    SubControlFrame,
    SubEffectListItemData,
    SubPositionFrame,
)
from ..models import (
    Color,
    ColorID,
    ColorMap,
    ControlMap,
    ControlMapElement,
    ControlMapStatus,
    DancersArray,
    DancersArrayItem,
    DancersArrayPartsItem,
    DancerStatus,
    FiberData,
    LEDBuldData,
    LEDData,
    LEDEffect,
    LEDEffectID,
    LEDMap,
    Location,
    ModelsArray,
    ModelsArrayItem,
    PartData,
    PartType,
    PosMap,
    PosMapElement,
    PosMapStatus,
    Revision,
)
from ..states import state


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
    pos_map_element.pos = pos_status_query_to_state(payload.pos)

    return pos_map_element


def pos_frame_sub_to_query(data: SubPositionFrame) -> QueryPosFrame:
    rev = QueryRevision(meta=data.rev.meta, data=data.rev.data)

    response = QueryPosFrame(start=data.start, pos=[], rev=rev)
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


def part_data_state_to_mut(
    part_data: PartData,
) -> Tuple[Union[LEDEffectID, ColorID], int]:
    if isinstance(part_data, LEDData):
        return (part_data.effect_id, part_data.alpha)
    else:
        return (part_data.color_id, part_data.alpha)


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


def control_frame_query_to_state(payload: QueryControlFrame) -> ControlMapElement:
    rev = Revision(meta=payload.rev.meta, data=payload.rev.data)

    control_map_element = ControlMapElement(
        start=payload.start, fade=payload.fade, status={}, rev=rev
    )

    control_map_element.status = control_status_query_to_state(payload.status)

    return control_map_element


def control_map_query_to_state(frames: QueryControlMapPayload) -> ControlMap:
    control_map: ControlMap = {}

    for id, frame in frames.items():
        control_map[id] = control_frame_query_to_state(frame)

    return control_map


def control_frame_sub_to_query(data: SubControlFrame) -> QueryControlFrame:
    rev = QueryRevision(meta=data.rev.meta, data=data.rev.data)

    response = QueryControlFrame(start=data.start, fade=data.fade, status=[], rev=rev)

    response.status = [
        [(partControl[0], partControl[1]) for partControl in partControls]
        for partControls in data.status
    ]

    return response


def control_status_state_to_mut(
    control_status: ControlMapStatus,
) -> List[MutDancerStatusPayload]:
    mut_dancer_status_payload: List[MutDancerStatusPayload] = []

    for dancer in state.dancers_array:
        dancer_name = dancer.name
        dancer_status = control_status.get(dancer_name)
        if dancer_status is None:
            raise Exception("Dancer status not found")

        mut_dancer_status_payload.append(
            [part_data_state_to_mut(dancer_status[part.name]) for part in dancer.parts]
        )

    return mut_dancer_status_payload


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
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
                    LEDBuldData(color_id=color_id, alpha=alpha)
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


def rgb_to_float(rgb: Tuple[int, ...]) -> Tuple[float, ...]:
    return tuple([color / 255 for color in rgb])


def float_to_rgb(color_float: Tuple[float, ...]) -> Tuple[int, ...]:
    return tuple([round(color * 255) for color in color_float])


def rgba_to_float(rgb: Union[Tuple[int, ...], List[int]], a: int) -> Tuple[float, ...]:
    r, g, b = rgb
    a_float = a / 255
    return (
        r / 255 * a_float,
        g / 255 * a_float,
        b / 255 * a_float,
    )
