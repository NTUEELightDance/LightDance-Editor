from threading import Thread

from textual.app import App
from textual.reactive import reactive

from .api import api
from .screens import ControlScreen, InfoScreen, LogScreen
from .types import DancerInfo, DancerItem, DancerStatus


class LightDanceApp(App):
    BINDINGS = [
        ("C", "switch_mode('control')", "Control Panel"),
        ("L", "switch_mode('log')", "Log Panel"),
        ("T", "switch_mode('table')", "RPi Info"),
    ]

    MODES = {
        "control": ControlScreen,
        "log": LogScreen,
        "table": InfoScreen,
    }

    dancer_status: reactive[DancerStatus] = reactive(
        DancerStatus(
            {
                "0": DancerItem(
                    False,
                    f"0",
                    "hostname",
                    "wifi",
                    True,
                    DancerInfo("IP", "MAC"),
                    DancerInfo("IP", "MAC"),
                ),
                "1": DancerItem(
                    False,
                    f"1",
                    "hostname",
                    "wifi",
                    True,
                    DancerInfo("IP", "MAC"),
                    DancerInfo("IP", "MAC"),
                ),
                "2": DancerItem(
                    False,
                    f"2",
                    "hostname",
                    "wifi",
                    True,
                    DancerInfo("IP", "MAC"),
                    DancerInfo("IP", "MAC"),
                ),
                "3": DancerItem(
                    False,
                    f"3",
                    "hostname",
                    "wifi",
                    True,
                    DancerInfo("IP", "MAC"),
                    DancerInfo("IP", "MAC"),
                ),
            }
        )
    )

    async def on_mount(self) -> None:
        self.switch_mode(mode="control")
        api.set_notifier(self.notify)
        Thread(target=api.connect, daemon=True).start()


app = LightDanceApp()
