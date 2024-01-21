from dataclasses import dataclass
from typing import List, Optional

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import RGB, ColorID, ColorName, MapID

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
    editing: Optional[MapID] = None


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
    editing: Optional[MapID] = None


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
    positionData: List[List[float]]


@dataclass
class MutEditPositionFrameResponse(JSONWizard):
    frameIds: List[MapID]


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


"""
ControlMap
"""


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
