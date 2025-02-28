from textual.app import App
from textual.widgets import RichLog

from ..types import DancerStatus


class LightDanceAppType(App[object]):
    dancer_status: DancerStatus
    log_instance: RichLog
