from dataclasses import dataclass

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import (
    RGB,
    ColorID,
    ColorName,
    LEDEffectID,
    LEDPartName,
    MapID,
    ModelName,
)

"""
Dancer
"""

MutDancerHasEffect = bool
MutDancerFade = bool
MutDancerStatusPayload = list[tuple[ColorID | LEDEffectID, int] | None]
MutDancerLEDStatusPayload = list[list[tuple[ColorID, int]] | None]

"""
ColorMap
"""


@dataclass
class ColorCreatecolorCodeInput(JSONWizard):
    set: RGB


@dataclass
class ColorCreateInput(JSONWizard):
    color: ColorName
    colorCode: ColorCreatecolorCodeInput
    autoCreateEffect: bool


@dataclass
class ColorUpdatecolorCodeInput(JSONWizard):
    set: RGB


@dataclass
class StringFieldUpdateOperationsInput(JSONWizard):
    set: ColorName


@dataclass
class ColorUpdateInput(JSONWizard):
    color: StringFieldUpdateOperationsInput
    colorCode: ColorUpdatecolorCodeInput


@dataclass
class MutAddColorResponse(JSONWizard):
    id: ColorID
    color: ColorName
    colorCode: RGB


@dataclass
class MutDeleteColorResponse(JSONWizard):
    id: ColorID
    msg: str
    ok: bool


@dataclass
class MutEditColorResponse(JSONWizard):
    id: ColorID
    color: ColorName
    colorCode: RGB


ADD_COLOR = gql(
    """
    mutation AddColor($color: ColorCreateInput!) {
        addColor(color: $color) {
            id
            color
            colorCode
        }
    }
    """
)

DELETE_COLOR = gql(
    """
    mutation DeleteColor($deleteColorId: Int!) {
        deleteColor(id: $deleteColorId) {
            id
            ok
            msg
        }
    }
    """
)

EDIT_COLOR = gql(
    """
    mutation EditColor($editColorId: Int!, $data: ColorUpdateInput!) {
        editColor(id: $editColorId, data: $data) {
            id
            color
            colorCode
        }
    }
    """
)


"""
PosMap
"""


@dataclass
class MutRequestEditPositionResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


REQUEST_EDIT_POS_BY_ID = gql(
    """
    mutation RequestEditPosition($frameId: Int!) {
        RequestEditPosition(FrameID: $frameId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutCancelEditPositionResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


CANCEL_EDIT_POS_BY_ID = gql(
    """
    mutation CancelEditPosition($frameId: Int!) {
        CancelEditPosition(FrameID: $frameId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutEditPositionFrameInput(JSONWizard):
    frameId: MapID
    positionData: list[list[float] | None]


@dataclass
class MutEditPositionFrameResponse(JSONWizard):
    frameIds: list[MapID]


EDIT_POS_FRAME = gql(
    """
    mutation EditPosMap($input: EditPositionMapInput!) {
        editPosMap(input: $input) {
            frameIds
        }
    }
    """
)


@dataclass
class MutAddPositionFrameResponse(JSONWizard):
    id: MapID


ADD_POS_FRAME = gql(
    """
    mutation AddPositionFrame($start: Int!, $positionData: [[Float!]!]) {
        addPositionFrame(start: $start, positionData: $positionData) {
            id
        }
    }
    """
)


@dataclass
class MutDeletePositionFrameInput(JSONWizard):
    frameID: MapID


@dataclass
class MutDeletePositionFrameResponse(JSONWizard):
    start: int
    id: MapID


DELETE_POS_FRAME = gql(
    """
    mutation DeletePositionFrame($input: DeletePositionFrameInput!) {
        deletePositionFrame(input: $input) {
            start
            id
        }
    }
    """
)


@dataclass
class MutEditPositionFrameTimeInput(JSONWizard):
    frameId: MapID
    start: int


@dataclass
class MutEditPositionFrameTimeResponse(JSONWizard):
    start: int
    id: MapID


EDIT_POS_FRAME_TIME = gql(
    """
    mutation EditPositionFrame($input: EditPositionFrameInput!) {
        editPositionFrame(input: $input) {
            start
            id
        }
    }
    """
)


"""
ControlMap
"""


@dataclass
class MutRequestEditControlResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


REQUEST_EDIT_CONTROL_BY_ID = gql(
    """
    mutation RequestEditControl($frameId: Int!) {
        RequestEditControl(FrameID: $frameId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutCancelEditControlResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


CANCEL_EDIT_CONTROL_BY_ID = gql(
    """
    mutation CancelEditControl($frameId: Int!) {
        CancelEditControl(FrameID: $frameId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutEditControlFrameInput(JSONWizard):
    frameId: MapID
    controlData: list[MutDancerStatusPayload]
    ledBulbData: list[MutDancerLEDStatusPayload]
    fade: bool | None = None


EDIT_CONTROL_FRAME = gql(
    """
    mutation Mutation($input: EditControlMapInput!) {
        editControlMap(input: $input)
    }
    """
)


ADD_CONTROL_FRAME = gql(
    """
    mutation AddControlFrame(
        $start: Int!
        $fade: Boolean
        $controlData: [[[Int!]!]!]
        $ledControlData: [[[[Int!]!]!]!]!
    ) {
        addControlFrame(start: $start, fade: $fade, controlData: $controlData, ledControlData: $ledControlData)
    }
    """
)


@dataclass
class MutDeleteControlFrameInput(JSONWizard):
    frameID: MapID


DELETE_CONTROL_FRAME = gql(
    """
    mutation DeleteControlFrame($input: DeleteControlFrameInput!) {
        deleteControlFrame(input: $input)
    }
    """
)


@dataclass
class MutEditControlFrameTimeInput(JSONWizard):
    frameId: MapID
    start: int


EDIT_CONTROL_FRAME_TIME = gql(
    """
    mutation EditControlFrame($input: EditControlFrameInput!) {
        editControlFrame(input: $input)
    }
    """
)


"""
TimeShift
"""


# @dataclass
# class MutTimeShiftMutationVariables(JSONWizard):
#     shiftPosition: bool
#     shiftControl: bool
#     move: int
#     end: int
#     start: int


@dataclass
class MutTimeShiftResponse(JSONWizard):
    ok: bool
    msg: str


SHIFT_TIME = gql(
    """
    mutation Shift(
        $shiftPosition: Boolean!
        $shiftControl: Boolean!
        $move: Int!
        $end: Int!
        $start: Int!
    ) {
        shift(
            shiftPosition: $shiftPosition
            shiftControl: $shiftControl
            move: $move
            end: $end
            start: $start
        ) {
            ok
            msg
        }
    }
    """
)


"""
To add effect list 
"""
ADD_EFFECT_LIST = gql(
    """
    mutation AddEffectList($end: Int!, $start: Int!, $description: str) {
        addEffectList(end: $end, start: $start, description: $description) {
            controlFrames
            positionFrames
            id
            end
            start
            description
        }
    }
    """
)


"""
To apply effect list
"""
APPLY_EFFECT_LIST = gql(
    """
    mutation ApplyEffectList($start: Int!, $applyEffectListId: Int!) {
        applyEffectList(start: $start, id: $applyEffectListId) {
            msg
            ok
        }
    }
    """
)


"""
To delete effect list
"""
DELETE_EFFECT_LIST = gql(
    """
    mutation DeleteEffectList($deleteEffectListId: Int!) {
        deleteEffectList(id: $deleteEffectListId) {
            ok
            msg
        }
    }
    """
)


"""
To add LED effect
"""


@dataclass
class MutAddLEDEffectResponse(JSONWizard):
    ok: bool
    msg: str


@dataclass
class MutAddLEDEffectResponsePayload(JSONWizard):
    addLEDEffect: MutAddLEDEffectResponse


@dataclass
class MutLEDEffectFramePayload(JSONWizard):
    leds: list[tuple[ColorID, int]]
    start: int
    fade: bool


@dataclass
class MutAddLEDEffectInput(JSONWizard):
    name: str
    modelName: ModelName
    partName: LEDPartName
    repeat: int
    frames: list[MutLEDEffectFramePayload]


ADD_LED_EFFECT = gql(
    """
    mutation Mutation($input: LEDEffectCreateInput!) {
        addLEDEffect(input: $input) {
            ok
            msg
        }
    }
    """
)


"""
To edit LED effect
"""


@dataclass
class MutRequestEditLEDEffectResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


REQUEST_EDIT_LED_EFFECT_BY_ID = gql(
    """
    mutation RequestEditLEDEffect($ledEffectId: Int!) {
        RequestEditLEDEffect(ledEffectId: $ledEffectId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutCancelEditLEDEffectResponse(JSONWizard):
    ok: bool
    editing: MapID | None = None


CANCEL_EDIT_LED_EFFECT_BY_ID = gql(
    """
    mutation CancelEditLEDEffect($ledEffectId: Int!) {
        CancelEditLEDEffect(ledEffectId: $ledEffectId) {
            editing
            ok
        }
    }
    """
)


@dataclass
class MutEditLEDEffectResponse(JSONWizard):
    ok: bool
    msg: str


@dataclass
class MutEditLEDEffectInput(JSONWizard):
    id: int
    name: str
    repeat: int
    frames: list[MutLEDEffectFramePayload]


EDIT_LED_EFFECT = gql(
    """
    mutation EditLEDEffect($input: EditLEDInput!) {
        editLEDEffect(input: $input) {
            ok
            msg
        }
    }
    """
)


"""
To delete LED effect
"""


@dataclass
class MutDeleteLEDEffectResponse(JSONWizard):
    ok: bool
    msg: str


DELETE_LED_EFFECT = gql(
    """
    mutation DeleteLEDEffect($deleteLedEffectId: Int!) {
        deleteLEDEffect(id: $deleteLedEffectId) {
            ok
            msg
        }
    }
    """
)
