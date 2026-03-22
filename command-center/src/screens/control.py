import asyncio
import threading
import time

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.coordinate import Coordinate
from textual.reactive import reactive
from textual.screen import Screen
from textual.timer import Timer
from textual.validation import Number, Regex
from textual.widgets import Button, DataTable, Footer, Input

from ..config import BT_SENDER_PORT, DANCER_LIST, MUSIC_FILE_PATH
from ..handlers import control_handler
from ..lps_ctrl import ESP32BTSender, Esp32TcpServer
from ..types import DancerStatus
from ..types.app import ControlScreenParamsType, LightDanceAppType


class ControlScreen(Screen):
    CSS_PATH = "../styles/control.tcss"
    BINDINGS = [
        ("S", "sync()", "Sync"),
        ("R", "send_color('r')", "R"),
        ("G", "send_color('g')", "G"),
        ("B", "send_color('b')", "B"),
        ("Y", "send_color('rg')", "RG"),
        ("C", "send_color('gb')", "GB"),
        ("M", "send_color('rb')", "RB"),
        ("D", "send_color('d')", "D"),
    ]

    app: LightDanceAppType
    table: DataTable[str]
    local_vars = ControlScreenParamsType(
        color_code="#000000",
        command="",
        music=MUSIC_FILE_PATH,
        delay=30,
        start_time=0,
    )
    dancer_table_initialized = False
    countdown: reactive[int] = reactive(0)
    timer: Timer | None = None
    sender: ESP32BTSender | None = None
    uploadServer: Esp32TcpServer | None = None

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
                    # yield Input(
                    #     name="starttime",
                    #     id="starttime-input",
                    #     validators=[Number(0, 999999)],
                    #     value="0",
                    #     restrict=r"\d{0,6}",
                    # )
                    # yield Button("Pause", id="control-pause")
                    yield Button("Stop", id="control-stop")
                    yield Button("Reset", id="control-refresh")
                    yield Button("Sync", id="control-sync")
                    yield Button("Download", id="control-upload")
                    yield Button("Upload", id="control-load")
                    yield Button("Seek", id="control-seek", classes="danger-buttons")
                with Horizontal():
                    yield Button("R", id="control-r")
                    yield Button("G", id="control-g")
                    yield Button("B", id="control-b")
                    yield Button("RG/Y", id="control-rg")
                    yield Button("GB/C", id="control-gb")
                    yield Button("RB/M", id="control-rb")
                    yield Button("Rainbow", id="control-d")
                    yield Button("W", id="control-w")
                    yield Button("Send color", id="control-send-color")
                    yield Input(
                        id="color-input",
                        value="#000000",
                        validators=[Regex(r"#[0-9a-f]{6}")],
                        restrict=r"#[0-9a-f]{0,6}",
                    )
                with Horizontal():
                    yield Button("Connect serial port", id="control-connect-serial")
                    yield Input(id="command-input", value=BT_SENDER_PORT)
                    yield Button("Load music file", id="control-load-music")
                    yield Input(id="command-music", value=MUSIC_FILE_PATH)
                    # yield Button(
                    #     "Close GPIO",
                    #     id="control-danger-close-gpio",
                    #     classes="danger-buttons",
                    # )
                    # yield Button(
                    #     "Reboot", id="control-danger-reboot", classes="danger-buttons"
                    # )
                    # yield Button(
                    #     "Restart Player",
                    #     id="control-danger-forced-restart",
                    #     classes="danger-buttons",
                    # )
            with VerticalScroll(id="control-panel-2"):
                yield self.app.control_table
        yield Footer()

    async def init_server(self):
        uploadServer = Esp32TcpServer(
            screen_ref=self.screen,
            dancer_status=self.app.dancer_status,
            act_fcn=self.update_connection_status_wifi,
            control_paths_list=[
                "../lighttable/control_" + str(i) + ".dat"
                for i in range(0, 27)
                # "../lighttable/control_" + str(i) + ".dat" for i in range(27)
            ],
            frame_paths_list=[
                "../lighttable/frame_" + str(i) + ".dat"
                for i in range(0, 27)
                # "../lighttable/frame_" + str(i) + ".dat" for i in range(27)
            ],
            port=3333,
        )
        await uploadServer.start()

    def start_server_thread(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.init_server())

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
                self.sender,
            )
        if event.button.id == "control-connect-serial":
            BT_SENDER_PORT = self.screen.local_vars.command
            self.sender = ESP32BTSender(
                screen_ref=self.screen, port=BT_SENDER_PORT, baud_rate=115200
            )
            try:
                self.sender.connect()
                self.notify("BTSender connected")
            except:
                self.notify(
                    f"Failed to connect to BTSender via {BT_SENDER_PORT}",
                    severity="error",
                )
        elif event.button.id == "control-sync":
            self.update_connection_status()
        elif event.button.id == "control-play":
            self.countdown = self.local_vars.delay
            self.timer = self.set_interval(1, self.timer_decrement)
        elif (
            event.button.id == "control-stop" or event.button.id == "control-pause"
        ) and self.timer:
            self.timer.stop()
            self.countdown = 0

    def on_input_changed(self, event: Input.Changed) -> None:
        value = event.input.value
        if event.input.id == "delay-input":
            if not value:
                value = 0
            self.local_vars.delay = int(value)
        elif event.input.id == "starttime-input":
            if not value:
                value = 0
            self.local_vars.start_time = int(value)
        elif event.input.id == "color-input":
            self.local_vars.color_code = value
        elif event.input.id == "command-input":
            self.local_vars.command = value
        elif event.input.id == "command-music":
            self.local_vars.music = value

    def on_mount(self) -> None:
        self.sender = ESP32BTSender(
            screen_ref=self.screen, port=BT_SENDER_PORT, baud_rate=115200
        )
        try:
            self.sender.connect()
            self.notify("BTSender connected")
        except:
            self.notify("BTSender is not connected", severity="error")
        control_handler(
            "control-load-music",
            [
                dancer.name
                for dancer in self.app.dancer_status.values()
                if dancer.selected
            ],
            self.screen,  # type: ignore
            self.sender,
        )
        self.table = self.app.control_table
        self.table.add_column("Name", key="Name")
        self.table.add_column("✔", key="Selected")
        self.table.add_column("Interface", key="Interface")
        self.table.add_column("Command response", key="Response", width=80)
        self.watch(self.app, "dancer_status", self.update_connection_status)
        server_thread = threading.Thread(target=self.start_server_thread, daemon=True)
        server_thread.start()

    def init_dancer_table(self) -> None:
        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            connected = dancer.ethernet_info.connected or dancer.wifi_info.connected
            self.table.add_row(
                f"[#00ff00]{name}[/]" if connected else f"[#ff0000]{name}[/]",
                "✔" if dancer.selected else "",
                dancer.interface if connected else "none",
                dancer.response,
                key=name,
            )
        self.refresh()

    def update_connection_status(self) -> None:  # TODO: Test this
        if not self.dancer_table_initialized and self.app.dancer_status:
            self.init_dancer_table()
            self.dancer_table_initialized = True
            return
        try:
            self.sender.trigger_check([])
            time.sleep(2)  # Wait for ESP32 to scan
            connection_result = self.sender.get_latest_report()
            # self.notify(str(connection_result["payload"]))
            # connection_result = {
            #     "from": "Host_PC",
            #     "topic": "check_report",
            #     "statusCode": 0,
            #     "payload": {
            #         "scan_duration_sec": 2,
            #         "found_count": 1,
            #         "found_devices": [
            #             {
            #                 "target_id": 1,
            #                 "cmd_id": 0,
            #                 "cmd_type": "PLAY",
            #                 "target_delay": 9365664,
            #                 "state": "TEST",
            #                 "timestamp": 1773239516.9176354
            #             }
            #         ]
            #     }
            # }
        except:
            self.notify("Can't get connection report", severity="error")
            return

        for name, dancer in self.app.dancer_status.items():
            self.app.dancer_status[name].interface = "none"
            self.app.dancer_status[name].wifi_info.connected = False
            self.app.dancer_status[name].response = ""

        for item in connection_result["payload"]["found_devices"]:
            if item["target_id"] == 0 or item["target_id"] > 27:
                continue
            target_id = item["target_id"]
            cmd_id = item["cmd_id"]
            cmd_type = item["cmd_type"]
            target_delay = item["target_delay"]
            state = item["state"]
            # timestamp = item["timestamp"]
            self.app.dancer_status[DANCER_LIST[target_id][0]].interface = "BLE"
            self.app.dancer_status[DANCER_LIST[target_id][0]].wifi_info.connected = True
            self.app.dancer_status[
                DANCER_LIST[target_id][0]
            ].response = f"State: {state}, Type: {cmd_type}, CID: {cmd_id}, Target Delay: {target_delay}"

        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            try:
                self.table.update_cell(
                    name,
                    "Name",
                    f"[#00ff00]{name}[/]"
                    if dancer.ethernet_info.connected or dancer.wifi_info.connected
                    else f"[#ff0000]{name}[/]",
                )
                self.table.update_cell(
                    name,
                    "Interface",
                    dancer.interface
                    if dancer.ethernet_info.connected or dancer.wifi_info.connected
                    else "none",
                )
                self.table.update_cell(name, "Response", dancer.response)
            except:
                continue
        self.table.refresh_column(0)
        self.table.refresh_column(2)
        self.table.refresh_column(3)
        self.notify("Updated connection status")

    def update_connection_status_wifi(self) -> None:  # TODO: Test this
        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            try:
                self.table.update_cell(
                    name,
                    "Name",
                    f"[#00ff00]{name}[/]"
                    if dancer.ethernet_info.connected or dancer.wifi_info.connected
                    else f"[#ff0000]{name}[/]",
                )
                self.table.update_cell(
                    name,
                    "Interface",
                    dancer.interface
                    if dancer.ethernet_info.connected or dancer.wifi_info.connected
                    else "none",
                )
                self.table.update_cell(name, "Response", dancer.response)
            except:
                continue
        self.table.refresh_column(0)
        self.table.refresh_column(2)
        self.table.refresh_column(3)
        self.notify("Updated connection status")

    def on_data_table_cell_selected(self, event: DataTable.CellSelected):
        row_key = event.cell_key[0].value
        column_key = event.cell_key[1].value
        if not row_key or column_key != "Selected":
            return
        self.app.dancer_status[row_key].selected ^= True
        self.table.update_cell(
            row_key, "Selected", "✔" if self.app.dancer_status[row_key].selected else ""
        )

    def on_data_table_cell_highlighted(self, event: DataTable.CellHighlighted):
        row_key = event.cell_key[0]
        self.table.cursor_coordinate = Coordinate(self.table.get_row_index(row_key), 1)

    def on_data_table_header_selected(self, event: DataTable.HeaderSelected):
        self.notify(f"Selected {event.column_index}")
        if event.column_index == 1:
            is_all_selected = all(
                dancer.selected for dancer in self.app.dancer_status.values()
            )
            for dancer in self.app.dancer_status.values():
                dancer.selected = not is_all_selected
                self.table.update_cell(
                    dancer.name,
                    "Selected",
                    "✔" if dancer.selected else "",
                )
            self.table.refresh_column(0)

    def action_send_color(self, color: str) -> None:
        control_handler(
            f"control-{color}",
            [
                dancer.name
                for dancer in self.app.dancer_status.values()
                if dancer.selected
            ],
            self.screen,  # type: ignore
            self.sender,
        )

    def action_sync(self) -> None:
        control_handler(
            "control-sync",
            [
                dancer.name
                for dancer in self.app.dancer_status.values()
                if dancer.selected
            ],
            self.screen,  # type: ignore
            self.sender,
        )

    def timer_decrement(self) -> None:
        if self.countdown > 0:
            self.countdown -= 1
            self.notify(f"Countdown: {self.countdown}")
        else:
            if self.timer:
                self.timer.stop()
