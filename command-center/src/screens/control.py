from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.screen import Screen
from textual.validation import Number, Regex
from textual.widgets import Button, DataTable, Footer, Input

from ..handlers import control_handler
from ..types import DancerStatus
from ..types.app import ControlScreenParamsType, LightDanceAppType


class ControlScreen(Screen):
    CSS_PATH = "../styles/control.tcss"
    BINDINGS = [
        ("R", "send_color('r')", "R"),
        ("G", "send_color('g')", "G"),
        ("B", "send_color('b')", "B"),
        ("Y", "send_color('rg')", "RG"),
        ("C", "send_color('gb')", "GB"),
        ("M", "send_color('rb')", "RB"),
        ("D", "send_color('d')", "D"),
    ]

    table = DataTable()

    app: LightDanceAppType
    local_vars = ControlScreenParamsType(
        color_code="#000000",
        command="",
        delay=30,
        start_time=0,
    )

    def compose(self) -> ComposeResult:
        with Vertical():
            with VerticalScroll(id="control-panel-buttons"):
                with Horizontal():
                    yield Button("Play", id="control-play")
                    yield Input(
                        name="delay",
                        id="delay-input",
                        validators=[Number(0, 999)],
                        value="30",
                        restrict=r"\d{0,3}",
                    )
                    yield Input(
                        name="starttime",
                        id="starttime-input",
                        validators=[Number(0, 999999)],
                        value="0",
                        restrict=r"\d{0,6}",
                    )
                    yield Button("Pause", id="control-pause")
                    yield Button("Stop", id="control-stop")
                    yield Button("Refresh", id="control-refresh")
                    yield Button("Sync", id="control-sync")
                    yield Button("Upload", id="control-upload")
                    yield Button("Load", id="control-load")
                with Horizontal():
                    yield Button("R", id="control-r")
                    yield Button("G", id="control-g")
                    yield Button("B", id="control-b")
                    yield Button("RG/Y", id="control-rg")
                    yield Button("GB/C", id="control-gb")
                    yield Button("RB/M", id="control-rb")
                    yield Button("D", id="control-d")
                    yield Button("W", id="control-w")
                    yield Button("Send color", id="control-send-color")
                    yield Input(
                        id="color-input",
                        value="#000000",
                        validators=[Regex(r"#[0-9a-f]{6}")],
                        restrict=r"#[0-9a-f]{0,6}",
                    )
                with Horizontal():
                    yield Button("Send Command", id="control-send-command")
                    yield Input(id="command-input")
                    yield Button(
                        "Close GPIO",
                        id="control-danger-close-gpio",
                        classes="danger-buttons",
                    )
                    yield Button(
                        "Reboot", id="control-danger-reboot", classes="danger-buttons"
                    )
                    yield Button(
                        "Restart Player",
                        id="control-danger-restart",
                        classes="danger-buttons",
                    )
            with VerticalScroll(id="control-panel-2"):
                yield self.table
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id:
            control_handler(
                event.button.id,
                [
                    dancer.name
                    for dancer in self.app.dancer_status.values()
                    if dancer.selected
                ],
                self.screen,  # type: ignore
            )

    def on_input_edited(self, event: Input.Changed) -> None:
        if event.input.id == "delay-input":
            self.local_vars.delay = int(event.input.value)
        elif event.input.id == "starttime-input":
            self.local_vars.start_time = int(event.input.value)
        elif event.input.id == "color-input":
            self.local_vars.color_code = event.input.value
        elif event.input.id == "command-input":
            self.local_vars.command = event.input.value

    def on_mount(self) -> None:
        self.table.add_column(
            "✔",
            key="Selected",
        )
        self.table.add_columns(
            "Interface",
        )
        self.table.add_column("Command response", width=100)
        self.watch(self.app, "dancer_status", self.update_dancer_table)

    def update_dancer_table(self) -> None:
        self.table.clear()
        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            connected = dancer.ethernet_info.connected or dancer.wifi_info.connected
            self.table.add_row(
                "✔" if dancer.selected else "",
                dancer.interface if connected else "none",
                dancer.response,
                key=name,
                label=f"[#00ff00]{name}[/]" if connected else f"[#ff0000]{name}[/]",
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
            row_key, "Selected", "✔" if self.app.dancer_status[row_key].selected else ""
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

    def action_send_color(self, color: str) -> None:
        control_handler(
            f"control-{color}",
            [
                dancer.name
                for dancer in self.app.dancer_status.values()
                if dancer.selected
            ],
            self.screen,  # type: ignore
        )
