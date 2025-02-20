from textual.app import ComposeResult
from textual.containers import Horizontal, VerticalScroll
from textual.screen import Screen
from textual.validation import Number, Regex
from textual.widgets import Button, DataTable, Footer, Input, Label

from ..handlers import control_handler
from ..types import DancerInfo, DancerItem, DancerStatus
from ..types.app import LightDanceAppType


class ControlScreen(Screen):
    CSS_PATH = "../styles/control.tcss"

    table = DataTable()

    app: LightDanceAppType

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
                yield self.table
        yield Footer()

    count = 20

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.notify(f"Button {event.button.label}")
        self.app.dancer_status = {
            **self.app.dancer_status,
            f"dancer{self.count}": DancerItem(
                False,
                f"{self.count}",
                "hostname",
                "wifi",
                True,
                DancerInfo("IP", "MAC"),
                DancerInfo("IP", "MAC"),
            ),
        }
        self.count += 1
        if event.button.id:
            control_handler(event.button.id)

    def on_mount(self) -> None:
        self.table.add_columns(
            "Name",
            "Hostname",
            "Interface",
            "Connected",
            "Ethernet IP",
            "Ethernet MAC",
            "WiFi IP",
            "WiFi MAC",
        )
        self.watch(self.app, "dancer_status", self.update_dancer_table)

    def update_dancer_table(self) -> None:
        self.table.clear()
        new_dancer_status: DancerStatus = getattr(self.app, "dancer_status")
        for name, dancer in new_dancer_status.items():
            self.table.add_row(
                name,
                dancer.hostname,
                dancer.interface,
                dancer.connected,
                dancer.ethernet_info.IP,
                dancer.ethernet_info.MAC,
                dancer.wifi_info.IP,
                dancer.wifi_info.MAC,
            )
        self.refresh()
