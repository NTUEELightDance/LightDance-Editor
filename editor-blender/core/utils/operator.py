from typing import Any, Callable, Dict, Optional

import bpy

slider_dragging_callback: Optional[Callable[[], None]] = None


def set_slider_dragging_callback(callback: Callable[[], None]):
    global slider_dragging_callback
    slider_dragging_callback = callback


def execute_slider_dragging_callback():
    global slider_dragging_callback
    if slider_dragging_callback is not None:
        slider_dragging_callback()
        slider_dragging_callback = None


def execute_operator(idname: str, **kwargs: Any):
    attrs = idname.split(".")
    if len(attrs) != 2:
        print("Invalid idname:", idname)
        return

    module_name, ops_name = attrs

    try:
        module = getattr(bpy.ops, module_name)
        ops: Callable[[str], Any] = getattr(module, ops_name)
        ops("INVOKE_DEFAULT", **kwargs)
        print("Executed operator:", idname)
    except:
        print("Failed to execute operator:", idname)
