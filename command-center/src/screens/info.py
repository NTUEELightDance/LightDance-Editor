from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import DataTable, Footer

from ..types import DancerStatus
from ..types.app import LightDanceAppType


class InfoScreen(Screen):
    app: LightDanceAppType
    table: DataTable = DataTable()

    def compose(self) -> ComposeResult:
        yield self.table
        yield Footer()

    def on_mount(self) -> None:
        self.table.add_columns(
            "Name",
            "Hostname",
            "Interface",
            "WLAN IP",
            "Ethernet MAC",
            "WLAN MAC",
        )
        self.watch(self.app, "dancer_status", self.update_dancer_table)

    def update_dancer_table(self) -> None:
        self.table.clear()
        new_dancer_status: DancerStatus = self.app.dancer_status
        for name, dancer in new_dancer_status.items():
            connected = dancer.ethernet_info.connected or dancer.wifi_info.connected
            self.table.add_row(
                f"[#00ff00]{name}[/]" if connected else f"[#ff0000]{name}[/]",
                dancer.hostname,
                dancer.interface if connected else "none",
                dancer.wifi_info.IP,
                dancer.ethernet_info.MAC,
                dancer.wifi_info.MAC,
                key=name,
            )
        self.refresh()
