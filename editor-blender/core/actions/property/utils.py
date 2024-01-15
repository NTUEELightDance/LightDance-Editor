from collections.abc import Callable
from typing import TypeVar

import bpy

from ....operators.utils import execute_operator
from ..state.utils import set_slider_dragging_callback

T = TypeVar("T")


def dragging_wrapper(
    update: Callable[[T, bpy.types.Context], None],
    end: Callable[[T, bpy.types.Context], None],
) -> Callable[[T, bpy.types.Context], None]:
    def wrapped(self: T, context: bpy.types.Context):
        wm = context.window_manager
        dragging_slider = getattr(wm, "dragging_slider")

        update(self, context)

        if not dragging_slider:
            set_slider_dragging_callback(lambda: end(self, context))
            execute_operator("lightdance.slider_dragging_listener")

    return wrapped
