from enum import Enum
from typing import List, Tuple


class ObjectType(Enum):
    DANCER = "dancer"
    HUMAN = "human"
    LIGHT = "light"


class LightType(Enum):
    FIBER = "fiber"
    LED = "led"
    LED_BULB = "led_bulb"


class PositionPropertyType:
    transform: Tuple[float, float, float]
    rotation: Tuple[float, float, float]


class ColorPaletteItemType:
    color_id: int
    color_name: str
    color_float: Tuple[float, float, float]

    color_rgb: Tuple[int, int, int]
    color_alpha: float
    color_code: str


ColorPaletteType = List[ColorPaletteItemType]
