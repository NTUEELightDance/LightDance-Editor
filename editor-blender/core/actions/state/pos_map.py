from ...models import PosMap, PosRecord
from ...states import state


async def set_pos_map(pos_map: PosMap):
    # TODO: Implement
    state.pos_map = pos_map


async def set_pos_record(pos_record: PosRecord):
    # TODO: Implement
    state.pos_record = pos_record
