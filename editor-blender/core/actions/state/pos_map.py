from ...models import PosMap
from ...states import state


async def set_pos_map(pos_map: PosMap):
    # TODO: Implement
    state.pos_map = pos_map
