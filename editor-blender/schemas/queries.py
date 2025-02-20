from dataclasses import dataclass

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import (
    ID,
    RGB,
    ColorID,
    ColorName,
    LEDEffectID,
    LEDEffectName,
    LEDModelName,
    LEDPartName,
    MapID,
    PartName,
    PartType,
)

"""
Fiber
"""

QueryFiberDataPayload = tuple[ColorID, int]

"""
LED
"""

QueryLEDDataPayload = tuple[LEDEffectID, int]
QueryLEDBulbDataPayload = list[tuple[ColorID, int]]


"""
LEDEffect
"""


@dataclass
class QueryLEDEffectFramePayload(JSONWizard):
    LEDs: list[tuple[ColorID, int]]
    start: int
    fade: bool


@dataclass
class QueryLEDEffectPayload(JSONWizard):
    id: LEDEffectID
    repeat: int
    frames: list[QueryLEDEffectFramePayload]


"""
Model
"""


@dataclass
class QueryModelPayloadItem(JSONWizard):
    id: ID
    name: str
    dancers: list[str]


QueryModelPayload = list[QueryModelPayloadItem]


GET_MODELS = gql(
    """
    query Models {
        models {
            id
            name
            dancers
        }
    }
    """
)


"""
Dancer
"""


QueryDancerStatusPayloadItem = QueryFiberDataPayload | QueryLEDDataPayload
QueryDancerStatusPayload = list[QueryDancerStatusPayloadItem]
QueryDancerLEDBulbStatusPayload = list[QueryLEDBulbDataPayload]


@dataclass
class QueryPartOrderByWithRelationInput(JSONWizard):
    class _(JSONWizard.Meta):
        skip_defaults = True

    # controlData: Optional[ControlDataOrderByRelationAggregateInput]
    # dancer: Optional[DancerOrderByWithRelationInput]
    id: str | None = None
    dancerId: str | None = None
    length: str | None = None
    name: str | None = None
    type: str | None = None


@dataclass
class QueryDancersPayloadPartItem(JSONWizard):
    name: PartName
    type: PartType
    length: int | None = None


@dataclass
class QueryDancersPayloadItem(JSONWizard):
    name: str
    parts: list[QueryDancersPayloadPartItem]


QueryDancersPayload = list[QueryDancersPayloadItem]


GET_DANCERS = gql(
    """
    query Dancers {
        dancers {
            name
            parts {
                name
                type
                length
            }
        }
    }
    """
    # """
    # query Dancers($orderBy: [PartOrderByWithRelationInput!]) {
    #     dancers {
    #         name
    #         parts(orderBy: $orderBy) {
    #             name
    #             type
    #             length
    #         }
    #     }
    # }
    # """
)


"""
Coordinates
"""

QueryCoordinatesPayload = tuple[float, float, float]


"""
Revision
"""


@dataclass
class QueryRevision(JSONWizard):
    meta: int
    data: int


"""
PositionRecord
"""


QueryPosRecordData = list[ID]


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
    rev: QueryRevision
    location: list[QueryCoordinatesPayload]
    rotation: list[QueryCoordinatesPayload]


QueryPosMapPayload = dict[ID, QueryPosFrame]


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


QueryControlRecordData = list[ID]

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
    rev: QueryRevision
    status: list[QueryDancerStatusPayload]
    led_status: list[QueryDancerLEDBulbStatusPayload]


QueryControlMapPayload = dict[ID, QueryControlFrame]


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
    controlFrames: list[QueryEffectListControlFrame]
    positionFrames: list[QueryEffectListPositionFrame]


QueryEffectListData = list[QueryEffectListItem]


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

QueryLEDMapPayload = dict[
    LEDModelName, dict[LEDPartName, dict[LEDEffectName, QueryLEDEffectPayload]]
]


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


QueryColorMapPayload = dict[ColorID, QueryColorMapPayloadItem]


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
