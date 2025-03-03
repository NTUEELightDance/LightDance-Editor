from threading import Thread

from textual.app import App
from textual.reactive import reactive
from textual.widgets import RichLog

from .api import api
from .screens import ControlScreen, InfoScreen, LogScreen, ParttestScreen
from .types import DancerStatus


class LightDanceApp(App):
    BINDINGS = [
        ("C", "switch_mode('control')", "Control Panel"),
        ("L", "switch_mode('log')", "Log Panel"),
        ("T", "switch_mode('table')", "RPi Info"),
        ("P", "switch_mode('parttest')", "Part Test"),
    ]

    MODES = {
        "control": ControlScreen,
        "log": LogScreen,
        "table": InfoScreen,
        "parttest": ParttestScreen,
    }

    dancer_status: reactive[DancerStatus] = reactive({})
    log_instance: RichLog = RichLog(highlight=True, wrap=False)
    pinmap: dict = {}

    def on_mount(self) -> None:
        self.switch_mode(mode="control")
        self.theme = "nord"
        api.set_app_ref(self.app)  # type: ignore
        Thread(target=api.connect, daemon=True).start()
        self.pinmap = api.get_pin_map()


app = LightDanceApp()
