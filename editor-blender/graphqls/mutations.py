from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import RGB, ColorID, ColorName

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
