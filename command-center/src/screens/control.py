from textual.app import ComposeResult
from textual.containers import Horizontal, VerticalScroll
from textual.screen import Screen
from textual.validation import Number, Regex
from textual.widgets import Button, DataTable, Footer, Input, Label

from ..handlers import control_handler
from ..types import DancerStatus
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
                    yield Button("Refresh", id="control-refresh")
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

    def on_button_pressed(self, event: Button.Pressed) -> None:
        self.notify(f"Button {event.button.label}")
        if event.button.id:
            control_handler(
                event.button.id,
                [
                    dancer.name
                    for dancer in self.app.dancer_status.values()
                    if dancer.selected
                ],
            )

    def on_mount(self) -> None:
        self.table.add_column(
            "Selected",
            key="Selected",
        )
        self.table.add_columns(
            "Name",
            "Hostname",
            "Interface",
        )
        self.watch(self.app, "dancer_status", self.update_dancer_table)

    def update_dancer_table(self) -> None:
        self.table.clear()
        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            connected = dancer.ethernet_info.connected or dancer.wifi_info.connected
            self.table.add_row(
                dancer.selected,
                f"[#00ff00]{name}[/]" if connected else f"[#ff0000]{name}[/]",
                dancer.hostname,
                dancer.interface,
                key=name,
                # label="\u2588\u2588"
            )
        self.refresh()

    def on_data_table_cell_selected(self, event: DataTable.CellSelected):
        row_key = event.cell_key[0].value
        column_key = event.cell_key[1].value
        self.notify(f"Selected {row_key} {column_key}")
        if not (row_key) or column_key != "Selected":
            return
        self.app.dancer_status[row_key].selected ^= True
        self.table.update_cell(
            row_key, "Selected", self.app.dancer_status[row_key].selected
        )

    def on_data_table_header_selected(self, event: DataTable.HeaderSelected):
        self.notify(f"Selected {event.column_index}")
        if event.column_index == 0:
            is_all_selected = all(
                dancer.selected for dancer in self.app.dancer_status.values()
            )
            for dancer in self.app.dancer_status.values():
                dancer.selected = not is_all_selected
            self.update_dancer_table()
