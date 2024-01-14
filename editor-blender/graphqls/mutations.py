from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union

from dataclass_wizard import JSONWizard
from gql import gql

from ..core.models import (
    RGB, ColorName, ColorCode, ColorID, RGBA, Color, ColorMap
)

"""
ColorMap
"""

ColorCreatecolorCodeInput = dict[str, RGB]

@dataclass
class ColorCreateInput(JSONWizard):
    color: ColorName
    colorCode: ColorCreatecolorCodeInput

@dataclass
class MutAddColorResponse(JSONWizard):
    id: int
    color: Color
    colorCode: RGB
    

@dataclass
class MutDeleteColorResponse(JSONWizard):
    id: int
    msg: str
    ok: bool

class MutEditColorResponse(JSONWizard):
    color: str

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
