from enum import Enum


class ObjectType(Enum):
    DANCER = "dancer"
    HUMAN = "human"
    LIGHT = "light"


class LightType(Enum):
    FIBER = "fiber"
    LED = "led"
    LED_BULB = "led_bulb"


class PositionPropertyType:
    transform: tuple[float, float, float]
    rotation: tuple[float, float, float]


class ColorPaletteItemType:
    color_id: int
    color_name: str
    color_float: tuple[float, float, float]

    color_rgb: tuple[int, int, int]
    color_alpha: float
    color_code: str


ColorPaletteType = list[ColorPaletteItemType]


class RevisionPropertyItemType:
    frame_id: int
    frame_start: int
    meta: int
    data: int


RevisionPropertyType = list[RevisionPropertyItemType]


class DancerModelHashItemType:
    dancer_name: str
    model_hash: str


class Preferences:
    auto_sync: bool
    follow_frame: bool
