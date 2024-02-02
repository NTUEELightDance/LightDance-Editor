from ...states import state
from ...utils.ui import redraw_area


def set_running(value: bool):
    state.running = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_logged_in(value: bool):
    state.logged_in = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_shifting(value: bool):
    state.shifting = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_requesting(value: bool):
    state.requesting = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_playing(value: bool):
    state.playing = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_ready(value: bool):
    state.ready = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
