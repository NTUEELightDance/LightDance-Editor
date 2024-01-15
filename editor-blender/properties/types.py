from enum import Enum
from typing import Tuple


class ObjectType(Enum):
    DANCER = "dancer"
    HUMAN = "human"
    LIGHT = "light"


class PositionPropertyType:
    transform: Tuple[float, float, float]
    rotation: Tuple[float, float, float]
