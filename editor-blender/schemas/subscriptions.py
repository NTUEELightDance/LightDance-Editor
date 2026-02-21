from dataclasses import dataclass
from enum import Enum

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import ID, RGB, ColorID, MapID

"""
Misc Types
"""


SubLEDControl = tuple[ColorID, int]
SubFiberControl = tuple[ColorID, int]
SubLEDBulbControl = tuple[ColorID, int]
SubPartControl = SubLEDControl | SubFiberControl
SubPartLEDBulbControl = list[SubLEDBulbControl]


@dataclass
class SubRevision(JSONWizard):
    meta: int
    data: int


"""
PositionRecord
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
    addID: list[int]
    updateID: list[int]
    deleteID: list[int]


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


SubCoordinatesPayload = tuple[float, float, float]
SubHasPositionPayload = bool


@dataclass
class SubPositionFrame(JSONWizard):
    start: int
    location: list[SubCoordinatesPayload]
    rotation: list[SubCoordinatesPayload]
    has_position: list[SubHasPositionPayload]
    rev: SubRevision
    editing: str | None = None


@dataclass
class SubPositionMapDataScalar(JSONWizard):
    createFrames: dict[ID, SubPositionFrame]
    updateFrames: dict[ID, SubPositionFrame]
    deleteFrames: list[ID]


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
    addID: list[int]
    updateID: list[int]
    deleteID: list[int]


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
    fade: list[bool]
    has_effect: list[bool]
    start: int
    rev: SubRevision
    status: list[list[SubPartControl]]
    led_status: list[list[SubPartLEDBulbControl]]
    editing: str | None = None


@dataclass
class SubControlMapDataScalar(JSONWizard):
    createFrames: dict[ID, SubControlFrame]
    updateFrames: dict[ID, SubControlFrame]
    deleteFrames: list[ID]


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
    controlFrames: list[SubEffectListControlFrame]
    positionFrames: list[SubEffectListPositionFrame]


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
    LEDs: list[tuple[int, int]]


@dataclass
class SubLEDRecordDataItem(JSONWizard):
    id: int
    name: str
    modelName: str
    partName: str
    frames: list[SubLEDRecordDataBulbData]


@dataclass
class SubLEDRecordData(JSONWizard):
    createEffects: list[SubLEDRecordDataItem]
    updateEffects: list[SubLEDRecordDataItem]
    deleteEffects: list[SubLEDRecordDataItem]


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
    color: str | None = None
    colorCode: RGB | None = None


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
