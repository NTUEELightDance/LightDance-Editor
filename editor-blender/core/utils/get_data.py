import asyncio
from typing import Tuple

from ...api.control_agent import control_agent
from ...api.pos_agent import pos_agent
from ..models import ControlMap, ControlRecord, PosMap, PosRecord
from ..states import state


async def get_control() -> Tuple[ControlMap, ControlRecord]:
    control_record = await control_agent.get_control_record()

    # Wait for the cache to be updated
    async def wait_for_control_map(retry: int = 0):
        while retry > 0 and len(control_record) != len(state.control_map.keys()):
            await asyncio.sleep(0.05)
            retry -= 1

        if retry == 0 and len(control_record) != len(state.control_map.keys()):
            raise Exception("Failed to get control map")

    if len(state.control_map.keys()) == 0:
        await control_agent.get_control_map_payload()

    if len(control_record) != len(state.control_map.keys()):
        await wait_for_control_map(100)

    return state.control_map, control_record


async def get_pos() -> Tuple[PosMap, PosRecord]:
    await pos_agent.get_pos_map_payload()
    pos_record = await pos_agent.get_pos_record()

    return state.pos_map, pos_record
