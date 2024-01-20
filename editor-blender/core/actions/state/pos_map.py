from ...models import MapID, PosMap, PosMapElement, PosRecord
from ...states import state
from ...utils.ui import redraw_area


def set_pos_map(pos_map: PosMap):
    state.pos_map = pos_map


def add_pos(id: MapID, frame: PosMapElement):
    state.pos_map[id] = frame

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def delete_pos(id: MapID):
    del state.pos_map[id]

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def update_pos(id: MapID, frame: PosMapElement):
    state.pos_map[id] = frame

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def set_pos_record(pos_record: PosRecord):
    state.pos_record = pos_record
