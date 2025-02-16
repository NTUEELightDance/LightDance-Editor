from textual.app import ComposeResult
from textual.containers import Horizontal, VerticalScroll
from textual.screen import Screen
from textual.validation import Number, Regex
from textual.widgets import Button, Footer, Input, Label, Placeholder

from ..handlers import control_handler


class ControlScreen(Screen):
    CSS_PATH = "../styles/control.tcss"

    def compose(self) -> ComposeResult:
        with Horizontal():
            with VerticalScroll(id="control-panel-buttons"):
                with Horizontal():
                    yield Button("Play", id="control-play")
                    yield Input(
                        id="delay-input",
                        validators=[Number(0, 999)],
                        value="30",
                        restrict=r"\d{0,3}",
                    )
                    yield Button("Pause", id="control-pause")
                    yield Button("Stop", id="control-stop")
                with Horizontal():
                    yield Button("Reconnect", id="control-reconnect")
                    yield Button("Sync", id="control-sync")
                    yield Button("Upload", id="control-upload")
                    yield Button("Load", id="control-load")
                with Horizontal():
                    yield Button("R", id="control-r")
                    yield Button("G", id="control-g")
                    yield Button("B", id="control-b")
                    yield Button("RG", id="control-rg")
                    yield Button("GB", id="control-gb")
                    yield Button("RB", id="control-rb")
                with Horizontal():
                    yield Button("Send color", id="control-send-color")
                    yield Input(
                        id="color-input",
                        value="#000000",
                        validators=[Regex(r"#[0-9a-fA-F]{6}")],
                        restrict=r"#[0-9a-fA-F]{0,6}",
                    )
                with Horizontal():
                    yield Button("Send Command", id="control-send-command")
                    yield Input(id="command-input")
                yield Label("Danger Zone", id="control-danger-zone-label")
                with Horizontal(id="control-danger-zone"):
                    yield Button("Close GPIO", id="control-close-gpio")
                    yield Button("Reboot", id="control-reboot")
                    yield Button("Restart Player")
            with VerticalScroll(id="control-panel-2"):
                yield Placeholder("Control Panel 2")
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.notify(f"Button {event.button.label} clicked")
        if event.button.id:
            control_handler(event.button.id)
