from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Footer, Placeholder


class InfoScreen(Screen):
    def compose(self) -> ComposeResult:
        yield Placeholder("RPi Info")
        yield Footer()
