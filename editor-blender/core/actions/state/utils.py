from typing import Callable, Optional

slider_dragging_callback: Optional[Callable[[], None]] = None


def set_slider_dragging_callback(callback: Callable[[], None]):
    global slider_dragging_callback
    slider_dragging_callback = callback


def execute_slider_dragging_callback():
    global slider_dragging_callback
    if slider_dragging_callback is not None:
        slider_dragging_callback()
        slider_dragging_callback = None
