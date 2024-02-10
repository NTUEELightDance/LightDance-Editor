from ...models import Color, ColorID, ColorMap, EditMode
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .color_palette import setup_color_palette_from_state
from .load import set_ctrl_keyframes_from_state


def set_color_map(color_map: ColorMap):
    state.color_map = color_map
    setup_color_palette_from_state(state.color_map)
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def add_color(id: ColorID, color: Color):
    color_map_updates = state.color_map_updates
    color_map_updates.added.append(color)

    if state.edit_state == EditMode.EDITING:
        state.color_map_pending.add_or_delete = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_color_map_updates_add_or_delete()
        notify("INFO", f"Added color {color.name}")


def delete_color(id: ColorID):
    color_map_updates = state.color_map_updates

    for color in color_map_updates.added:
        if color.id == id:
            color_map_updates.added.remove(color)

            if len(color_map_updates.added) == 0 or len(color_map_updates.deleted) == 0:
                state.color_map_pending.add_or_delete = False

            return

    for color in color_map_updates.updated:
        if color.id == id:
            color_map_updates.updated.remove(color)

    color_map_updates.deleted.append(id)

    if state.edit_state == EditMode.EDITING:
        state.color_map_pending.add_or_delete = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        color_name = state.color_map[id].name
        apply_color_map_updates_add_or_delete()
        notify("INFO", f"Deleted color {color_name}")


def update_color(id: ColorID, color: Color):
    color_map_updates = state.color_map_updates

    for added_color in color_map_updates.added:
        if added_color.id == id:
            color_map_updates.added.remove(added_color)
            color_map_updates.added.append(color)
            return

    for updated_color in color_map_updates.updated:
        if updated_color.id == id:
            color_map_updates.updated.remove(updated_color)
            color_map_updates.updated.append(color)
            return

    color_map_updates.updated.append(color)

    state.color_map_pending.update = True
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def apply_color_map_updates_add_or_delete():
    color_map_updates = state.color_map_updates

    for color in color_map_updates.added:
        state.color_map[color.id] = color

    for color_id in color_map_updates.deleted:
        del state.color_map[color_id]

    color_map_updates.added.clear()
    color_map_updates.deleted.clear()

    setup_color_palette_from_state(state.color_map)

    state.color_map_pending.add_or_delete = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def apply_color_map_updates_update():
    color_map_updates = state.color_map_updates

    for color in color_map_updates.updated:
        state.color_map[color.id] = color
        set_ctrl_keyframes_from_state()  # TODO: test this

    color_map_updates.updated.clear()

    state.color_map_pending.update = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
