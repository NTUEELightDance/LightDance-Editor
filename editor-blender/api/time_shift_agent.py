from dataclasses import dataclass
from typing import Tuple

from ..client import client
from ..core.models import FrameType
from ..core.utils.convert import color_map_query_to_state
from ..graphqls.mutations import SHIFT_TIME, MutTimeShiftResponse
from ..graphqls.queries import GET_COLOR_MAP, QueryColorMapData


@dataclass
class ShiftResult:
    ok: bool
    msg: str


@dataclass
class TimeShiftAgent:
    async def shfit(
        self, frame_type: FrameType, interval: Tuple[int, int], displacement: int
    ) -> ShiftResult:
        shiftControl = frame_type == FrameType.CONTROL or frame_type == FrameType.BOTH
        shiftPosition = frame_type == FrameType.POS or frame_type == FrameType.BOTH
        start = interval[0]
        end = interval[1]
        move = displacement

        response = await client.execute(
            MutTimeShiftResponse,
            SHIFT_TIME,
            {
                "shiftControl": shiftControl,
                "shiftPosition": shiftPosition,
                "move": move,
                "end": end,
                "start": start,
            },
        )
        response = response["shift"]

        return ShiftResult(ok=response.ok, msg=response.msg)


time_shift_agent = TimeShiftAgent()
