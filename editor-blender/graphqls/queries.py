from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import (
    ID,
    RGB,
    ColorID,
    ColorName,
    LEDEffectID,
    LEDEffectName,
    LEDPartName,
    MapID,
    PartName,
    PartType,
)

"""
Fiber
"""

QueryFiberDataPayload = Tuple[ColorID, int]

"""
LED
"""

QueryLEDDataPayload = Tuple[LEDEffectID, int]


"""
LEDEffect
"""


@dataclass
class QueryLEDEffectFramePayload(JSONWizard):
    LEDs: List[Tuple[ColorID, int]]
    start: int
    fade: bool


@dataclass
class QueryLEDEffectPayload(JSONWizard):
    id: LEDEffectID
    repeat: int
    frames: List[QueryLEDEffectFramePayload]


"""
Dancer
"""


QueryDancerStatusPayloadItem = Union[QueryFiberDataPayload, QueryLEDDataPayload]
QueryDancerStatusPayload = List[QueryDancerStatusPayloadItem]


@dataclass
class QueryPartOrderByWithRelationInput(JSONWizard):
    class _(JSONWizard.Meta):
        skip_defaults = True

    # controlData: Optional[ControlDataOrderByRelationAggregateInput]
    # dancer: Optional[DancerOrderByWithRelationInput]
    id: Optional[str] = None
    dancerId: Optional[str] = None
    length: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None


@dataclass
class QueryDancersPayloadPartItem(JSONWizard):
    name: PartName
    type: PartType
    length: Optional[int] = None


@dataclass
class QueryDancersPayloadItem(JSONWizard):
    name: str
    parts: List[QueryDancersPayloadPartItem]


QueryDancersPayload = List[QueryDancersPayloadItem]


GET_DANCERS = gql(
    # """
    # query Dancers {
    #     dancers {
    #         name
    #         parts {
    #             name
    #             type
    #             length
    #         }
    #     }
    # }
    # """
    """
    query Dancers($orderBy: [PartOrderByWithRelationInput!]) {
        dancers {
            name
            parts(orderBy: $orderBy) {
                name
                type
                length
            }
        }
    }
    """
)


"""
Coordinates
"""

QueryCoordinatesPayload = Tuple[float, float, float]


"""
PositionRecord
"""


QueryPosRecordData = List[ID]


GET_POS_RECORD = gql(
    """
    query posRecord {
        positionFrameIDs
    }
    """
)


"""
PositionMap
"""


@dataclass
class QueryPosFrame(JSONWizard):
    start: int
    pos: List[QueryCoordinatesPayload]


QueryPosMapPayload = Dict[ID, QueryPosFrame]


@dataclass
class QueryPosMapData(JSONWizard):
    frameIds: QueryPosMapPayload


GET_POS_MAP = gql(
    """
    query posMap {
        PosMap {
            frameIds
        }
    }
    """
)


"""
ControlRecord
"""


QueryControlRecordData = List[ID]

GET_CONTROL_RECORD = gql(
    """
    query controlRecord {
        controlFrameIDs
    }
    """
)


"""
ControlMap
"""


@dataclass
class QueryControlFrame(JSONWizard):
    start: int
    fade: bool
    status: List[QueryDancerStatusPayload]


QueryControlMapPayload = Dict[ID, QueryControlFrame]


@dataclass
class QueryControlMapData(JSONWizard):
    frameIds: QueryControlMapPayload


GET_CONTROL_MAP = gql(
    """
    query controlMap {
        ControlMap {
            frameIds
        }
    }
    """
)


"""
EffectList
"""


@dataclass
class QueryEffectListControlFrame(JSONWizard):
    id: MapID
    start: int
    fade: bool


@dataclass
class QueryEffectListPositionFrame(JSONWizard):
    id: MapID
    start: int


@dataclass
class QueryEffectListItem(JSONWizard):
    start: int
    end: int
    description: str
    id: LEDEffectID
    controlFrames: List[QueryEffectListControlFrame]
    positionFrames: List[QueryEffectListPositionFrame]


QueryEffectListData = List[QueryEffectListItem]


GET_EFFECT_LIST = gql(
    """
    query EffectList {
        effectList {
            start
            end
            description
            id
            controlFrames
            positionFrames
        }
    }
    """
)


"""
LEDMap
"""


QueryLEDMapPayload = Dict[LEDPartName, Dict[LEDEffectName, QueryLEDEffectPayload]]


@dataclass
class QueryLEDMapData(JSONWizard):
    LEDMap: QueryLEDMapPayload


GET_LED_MAP = gql(
    """
    query LEDMap {
        LEDMap {
            LEDMap
        }
    }
    """
)


"""
ColorMap
"""


@dataclass
class QueryColorMapPayloadItem(JSONWizard):
    color: ColorName
    colorCode: RGB


QueryColorMapPayload = Dict[ColorID, QueryColorMapPayloadItem]


@dataclass
class QueryColorMapData(JSONWizard):
    colorMap: QueryColorMapPayload


GET_COLOR_MAP = gql(
    """
    query ColorMap {
        colorMap {
            colorMap
        }
    }
    """
)
