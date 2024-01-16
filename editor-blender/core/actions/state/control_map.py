from ...models import ControlMap, ControlRecord
from ...states import state


async def set_control_map(control_map: ControlMap):
    # TODO: Implement
    state.control_map = control_map


async def set_control_record(control_record: ControlRecord):
    # TODO: Implement
    state.control_record = control_record
