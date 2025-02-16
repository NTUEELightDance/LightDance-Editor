from textual.app import ComposeResult
from textual.screen import Screen
from textual.widgets import Footer, Placeholder


class LogScreen(Screen):
    def compose(self) -> ComposeResult:
        yield Placeholder("Log Panel")
        yield Footer()
