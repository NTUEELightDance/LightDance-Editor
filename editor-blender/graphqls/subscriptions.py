from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple, Union

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import ID, RGB, ColorID, MapID

"""
Misc Types
"""


SubLEDControl = Tuple[ColorID, int]
SubFiberControl = Tuple[ColorID, int]
SubLEDBulbControl = Tuple[ColorID, int]
SubPartControl = Union[SubLEDControl, SubFiberControl]
SubPartLEDBulbControl = List[SubLEDBulbControl]


@dataclass
class SubRevision(JSONWizard):
    meta: int
    data: int


"""
PositoinRecord
"""


class SubPositionMutation(Enum):
    CREATED_DELETED = "CREATED_DELETED"
    UPDATED_DELETED = "UPDATED_DELETED"
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"


@dataclass
class SubPositionRecordData(JSONWizard):
    mutation: SubPositionMutation
    editBy: int
    index: int
    addID: List[int]
    updateID: List[int]
    deleteID: List[int]


SUB_POS_RECORD = gql(
    """
    subscription PositionRecordSubscription {
        positionRecordSubscription {
            mutation
            editBy
            index
            addID
            updateID
            deleteID
        }
    }
    """
)


"""
PositionMap
"""


SubPosition = Tuple[float, float, float]


@dataclass
class SubPositionFrame(JSONWizard):
    start: int
    pos: List[SubPosition]
    rev: SubRevision
    editing: Optional[str] = None


@dataclass
class SubPositionMapDataScalar(JSONWizard):
    createFrames: Dict[ID, SubPositionFrame]
    updateFrames: Dict[ID, SubPositionFrame]
    deleteFrames: List[ID]


@dataclass
class SubPositionMapData(JSONWizard):
    frame: SubPositionMapDataScalar
    editBy: int


SUB_POS_MAP = gql(
    """
    subscription PositionMapSubscription {
        positionMapSubscription {
            frame
            editBy
        }
    }
    """
)


"""
ControlRecord
"""


class SubControlMutation(Enum):
    CREATED_DELETED = "CREATED_DELETED"
    UPDATED_DELETED = "UPDATED_DELETED"
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"


@dataclass
class SubControlRecordData(JSONWizard):
    mutation: SubControlMutation
    editBy: int
    index: int
    addID: List[int]
    updateID: List[int]
    deleteID: List[int]


SUB_CONTROL_RECORD = gql(
    """
    subscription ControlRecordSubscription {
        controlRecordSubscription {
            mutation
            editBy
            index
            addID
            updateID
            deleteID
        }
    }
    """
)


"""
ControlMap
"""


@dataclass
class SubControlFrame(JSONWizard):
    fade: bool
    start: int
    rev: SubRevision
    status: List[List[SubPartControl]]
    led_status: List[List[SubPartLEDBulbControl]]
    editing: Optional[str] = None


@dataclass
class SubControlMapDataScalar(JSONWizard):
    createFrames: Dict[ID, SubControlFrame]
    updateFrames: Dict[ID, SubControlFrame]
    deleteFrames: List[ID]


@dataclass
class SubControlMapData(JSONWizard):
    frame: SubControlMapDataScalar
    editBy: int


SUB_CONTROL_MAP = gql(
    """
    subscription ControlMapSubscription {
        controlMapSubscription {
            frame
            editBy
        }
    }
    """
)


"""
EffectList
"""


class SubEffectListMutation(Enum):
    CREATED = "CREATED"
    DELETED = "DELETED"


@dataclass
class SubEffectListControlFrame(JSONWizard):
    id: MapID
    start: int
    fade: bool


@dataclass
class SubEffectListPositionFrame(JSONWizard):
    id: MapID
    start: int


@dataclass
class SubEffectListItemData(JSONWizard):
    start: int
    end: int
    description: str
    id: int
    controlFrames: List[SubEffectListControlFrame]
    positionFrames: List[SubEffectListPositionFrame]


@dataclass
class SubEffectListData(JSONWizard):
    mutation: SubEffectListMutation
    effectListID: int
    editBy: int
    effectListData: SubEffectListItemData


SUB_EFFECT_LIST = gql(
    """
    subscription EffectListSubscription {
        effectListSubscription {
            mutation
            effectListID
            editBy
            effectListData {
                start
                end
                description
                id
                controlFrames
                positionFrames
            }
        }
    }
    """
)


@dataclass
class SubLEDRecordDataBulbData(JSONWizard):
    LEDs: List[Tuple[int, int]]


@dataclass
class SubLEDRecordDataItem(JSONWizard):
    id: int
    name: str
    modelName: str
    partName: str
    frames: List[SubLEDRecordDataBulbData]


@dataclass
class SubLEDRecordData(JSONWizard):
    createEffects: List[SubLEDRecordDataItem]
    updateEffects: List[SubLEDRecordDataItem]
    deleteEffects: List[SubLEDRecordDataItem]


SUB_LED_RECORD = gql(
    """
    subscription ledRecordSubscription {
        ledRecordSubscription {
            createEffects {
                id
                name
                modelName
                partName
                frames {
                    LEDs
                }
            }
            updateEffects {
                id
                name
                modelName
                partName
                frames {
                    LEDs
                }
            }
            deleteEffects {
                id
                name
                modelName
                partName
                frames {
                    LEDs
                }
            }
        }
    }
    """
)


"""
Color
"""


class SubColorMutation(Enum):
    CREATED = "CREATED"
    UPDATED = "UPDATED"
    DELETED = "DELETED"


@dataclass
class SubColorData(JSONWizard):
    id: ColorID
    mutation: SubColorMutation
    color: Optional[str] = None
    colorCode: Optional[RGB] = None


SUB_COLOR_MAP = gql(
    """
    subscription colorSub {
        colorSubscription {
            id
            color
            colorCode
            mutation
        }
    }
    """
)
