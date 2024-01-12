from dataclasses import dataclass
from typing import Dict, List, Tuple, Union

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
    query controlmap {
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
