from enum import Enum
from typing import Tuple


class LoginPanelStatusType:
    username: str
    password: str


class ColorPaletteStatusType:
    edit_index: int
    edit_mode: str


class ColorPaletteEditModeType(Enum):
    IDLE = "idle"
    EDIT = "edit"
    NEW = "new"


class ControlEditorStatusType:
    multi_select: bool
    multi_select_color: str
    multi_select_alpha: int


class PosEditorStatusType:
    multi_select: bool
    multi_select_delta_transform: Tuple[float, float, float]
    multi_select_delta_transform_ref: Tuple[float, float, float]
