from ...models import Color, ColorID, ColorMap
from ...states import state
from ...utils.ui import redraw_area
from .color_palette import setup_color_palette_from_state


def set_color_map(color_map: ColorMap):
    state.color_map = color_map
    setup_color_palette_from_state(state.color_map)
    redraw_area("VIEW_3D")


def add_color(id: ColorID, color: Color):
    state.color_map[id] = color
    setup_color_palette_from_state(state.color_map)
    redraw_area("VIEW_3D")


def delete_color(id: ColorID):
    del state.color_map[id]
    setup_color_palette_from_state(state.color_map)
    redraw_area("VIEW_3D")


def update_color(id: ColorID, color: Color):
    state.color_map[id] = color
    setup_color_palette_from_state(state.color_map)

    # TODO: Update animation data

    redraw_area("VIEW_3D")
