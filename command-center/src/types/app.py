from textual.app import App

from ..types import DancerStatus


class LightDanceAppType(App):
    dancer_status: DancerStatus
