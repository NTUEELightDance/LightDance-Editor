from ...models import ControlMap, ControlMapElement, ControlRecord, MapID
from ...states import state
from ...utils.ui import redraw_area


def set_control_map(control_map: ControlMap):
    state.control_map = control_map


def add_control(id: MapID, frame: ControlMapElement):
    state.control_map[id] = frame

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def delete_control(id: MapID):
    del state.control_map[id]

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def update_control(id: MapID, frame: ControlMapElement):
    state.control_map[id] = frame

    # TODO: Update animation data

    redraw_area("VIEW_3D")


def set_control_record(control_record: ControlRecord):
    state.control_record = control_record
