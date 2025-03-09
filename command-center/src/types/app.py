from dataclasses import dataclass
from typing import Literal

from textual.app import App
from textual.reactive import reactive
from textual.screen import Screen
from textual.widgets import DataTable, RichLog

from ..types import DancerStatus


class LightDanceAppType(App[object]):
    dancer_status: reactive[DancerStatus]
    log_instance: RichLog
    pinmap: dict[
        str,
        dict[Literal["dancer", "fps", "OFPARTS", "LEDPARTS", "LEDPARTS_MERGE"], dict],
    ]
    control_table: DataTable[str]


@dataclass
class ControlScreenParamsType:
    color_code: str
    command: str
    delay: int
    start_time: int


class ControlScreenType(Screen[object]):
    app: LightDanceAppType
    local_vars: ControlScreenParamsType
