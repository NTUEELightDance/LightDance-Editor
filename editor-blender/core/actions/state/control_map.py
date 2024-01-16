from ...models import ControlMap
from ...states import state


async def set_control_map(control_map: ControlMap):
    # TODO: Implement
    state.control_map = control_map
