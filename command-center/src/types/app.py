from dataclasses import dataclass
from typing import Literal

from textual.app import App
from textual.screen import Screen
from textual.widgets import RichLog

from ..types import DancerStatus


class LightDanceAppType(App[object]):
    dancer_status: DancerStatus
    log_instance: RichLog
    pinmap: dict[
        str,
        dict[Literal["dancer", "fps", "OFPARTS", "LEDPARTS", "LEDPARTS_MERGE"], dict],
    ]


@dataclass
class ControlScreenParamsType:
    color_code: str
    command: str
    delay: int
    start_time: int


class ControlScreenType(Screen[object]):
    app: LightDanceAppType
    local_vars: ControlScreenParamsType
