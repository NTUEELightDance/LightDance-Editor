from textual.app import ComposeResult
from textual.containers import Vertical
from textual.screen import Screen
from textual.widgets import Footer, Tree

from ..api import api
from ..types.app import LightDanceAppType


class ParttestScreen(Screen):
    BINDINGS = [
        ("r", "send_color('#ff0000')", "R"),
        ("g", "send_color('#00ff00')", "G"),
        ("b", "send_color('#0000ff')", "B"),
        ("y", "send_color('#ffff00')", "RG"),
        ("c", "send_color('#00ffff')", "GB"),
        ("m", "send_color('#ff00ff')", "RB"),
        ("w", "send_color('#ffffff')", "RB"),
        ("d", "send_color('#000000')", "D"),
    ]

    app: LightDanceAppType

    selected_dancer: str | None
    selected_part: str | None

    def compose(self) -> ComposeResult:
        tree: Tree[str] = Tree("Pinmap")
        tree.root.expand()
        for dancer, dancer_data in self.app.pinmap.items():
            dancer_node = tree.root.add(dancer)
            fiber_data = dancer_data["OFPARTS"]
            for part_name, part_channel in fiber_data.items():
                dancer_node.add_leaf(
                    f"{part_name} - {part_channel}", data=f"{dancer}.{part_name}"
                )
            led_data = dancer_data["LEDPARTS"]
            for part_name, part_data in led_data.items():
                dancer_node.add_leaf(
                    f"{part_name} - {part_data['id']} - length {part_data['len']}",
                    data=f"{dancer}.{part_name}",
                )
        with Vertical():
            yield tree
        yield Footer()

    def on_tree_node_selected(self, message: Tree.NodeSelected[str]):
        if message.node.data:
            self.selected_dancer, self.selected_part = message.node.data.split(".")
            self.notify(f"Selected node: {message.node.data}")

    def action_send_color(self, color_code: str):
        if self.selected_dancer and self.selected_part:
            api.send(
                {
                    "topic": "webShell",
                    "payload": {
                        "dancers": [self.selected_dancer],
                        "command": f"parttest {self.selected_part} --hex {color_code} -a 200",
                    },
                }
            )
