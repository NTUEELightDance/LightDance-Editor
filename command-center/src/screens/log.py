from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Footer

from ..types.app import LightDanceAppType


class LogScreen(Screen):
    app: LightDanceAppType

    def compose(self) -> ComposeResult:
        yield self.app.log_instance
        yield Footer()
