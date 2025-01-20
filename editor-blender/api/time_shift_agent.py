import asyncio
import traceback
from dataclasses import dataclass

from ..client import client
from ..core.models import FrameType
from ..schemas.mutations import SHIFT_TIME, MutTimeShiftResponse


@dataclass
class ShiftResult:
    ok: bool
    msg: str


@dataclass
class TimeShiftAgent:
    async def shift(
        self, frame_type: FrameType, interval: tuple[int, int], displacement: int
    ) -> ShiftResult:
        try:
            shiftControl = (
                frame_type == FrameType.CONTROL or frame_type == FrameType.BOTH
            )
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

        except asyncio.CancelledError:
            return ShiftResult(ok=False, msg="Timeout")

        except Exception as e:
            traceback.print_exc()
            return ShiftResult(ok=False, msg=str(e))


time_shift_agent = TimeShiftAgent()
