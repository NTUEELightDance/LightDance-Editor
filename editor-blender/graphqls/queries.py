from dataclasses import dataclass
from typing import Dict, List, Tuple, Union

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import ID, RGB, ColorID, ColorName

"""
Fiber
"""

QueryFiberDataPayload = Tuple[ColorID, int]

"""
LED
"""

QueryLEDDataPayload = Tuple[ColorID, int]


"""
Dancer
"""


QueryDancerStatusPayloadItem = Union[QueryFiberDataPayload, QueryLEDDataPayload]
QueryDancerStatusPayload = List[QueryDancerStatusPayloadItem]


"""
ControlMap
"""


@dataclass
class QueryControlMapPayloadItem(JSONWizard):
    start: int
    fade: bool
    status: List[QueryDancerStatusPayload]


QueryControlMapPayload = Dict[ID, QueryControlMapPayloadItem]


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
