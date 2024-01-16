from ...models import ColorMap
from ...states import state
from ...utils.ui import redraw_area


async def set_color_map(color_map: ColorMap):
    state.color_map = color_map
    state.is_colorpalette_updated = False
    redraw_area("VIEW_3D")
