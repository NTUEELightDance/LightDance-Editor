from enum import Enum


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
