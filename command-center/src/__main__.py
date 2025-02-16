from textual.app import App

from .screens import ControlScreen, InfoScreen, LogScreen


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

    def on_mount(self) -> None:
        self.switch_mode("control")


if __name__ == "__main__":
    app = LightDanceApp()
    app.run()
