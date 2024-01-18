from ...models import ColorMap
from ...states import state
from ...utils.ui import redraw_area
from .color_palette import setup_color_data_from_state


async def set_color_map(color_map: ColorMap):
    state.color_map = color_map
    setup_color_data_from_state(state.color_map)
    redraw_area("VIEW_3D")
