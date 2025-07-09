from contextlib import contextmanager

from ...states import state
from ...utils.ui import redraw_area


def set_running(value: bool):
    state.running = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_sync(value: bool):
    state.sync = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_logged_in(value: bool):
    state.logged_in = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_shifting(value: bool):
    state.shifting = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


# Use with send_request(): instead of set_requesting(true)...set_requesting(false)
# With statement does not create scope, so the variable created in "with" can be accessed outside of "with"
@contextmanager
def send_request():
    state.requesting = True
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    # when with statement is exited(e.g. due to error), finally will be run
    try:
        yield
    finally:
        state.requesting = False


def set_playing(value: bool):
    state.playing = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def set_ready(value: bool):
    state.ready = value
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
