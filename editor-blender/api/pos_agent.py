import asyncio
from dataclasses import dataclass
from typing import Any, Coroutine, List, Optional

from ..client import client
from ..core.models import MapID, PosMap, PosRecord
from ..core.utils.convert import pos_map_query_to_state
from ..graphqls.mutations import (
    ADD_POS_FRAME,
    CANCEL_EDIT_POS_BY_ID,
    DELETE_POS_FRAME,
    EDIT_POS_FRAME,
    EDIT_POS_FRAME_TIME,
    REQUEST_EDIT_POS_BY_ID,
    MutAddPositionFrameResponse,
    MutCancelEditPositionResponse,
    MutDeletePositionFrameInput,
    MutDeletePositionFrameResponse,
    MutEditPositionFrameInput,
    MutEditPositionFrameResponse,
    MutEditPositionFrameTimeInput,
    MutEditPositionFrameTimeResponse,
    MutRequestEditPositionResponse,
)
from ..graphqls.queries import (
    GET_POS_MAP,
    GET_POS_RECORD,
    QueryPosMapData,
    QueryPosMapPayload,
    QueryPosRecordData,
)


@dataclass
class PosAgent:
    async def get_pos_record(self) -> Optional[PosRecord]:
        try:
            response = await client.execute(
                QueryPosRecordData,
                GET_POS_RECORD,
            )
            controlRecord = response["positionFrameIDs"]

            return controlRecord

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def get_pos_map_payload(self) -> Optional[QueryPosMapPayload]:
        try:
            response = await client.execute(QueryPosMapData, GET_POS_MAP)
            posMap = response["PosMap"]

            return posMap.frameIds

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def get_pos_map(self) -> Optional[PosMap]:
        try:
            response = await client.execute(QueryPosMapData, GET_POS_MAP)
            posMap = response["PosMap"]

            return pos_map_query_to_state(posMap.frameIds)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def add_frame(
        self, start: int, positionData: List[List[float]]
    ) -> Optional[MapID]:
        try:
            response = await client.execute(
                MutAddPositionFrameResponse,
                ADD_POS_FRAME,
                {"start": start, "positionData": positionData},
            )
            return response["addPositionFrame"].id

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def save_frame(
        self, id: MapID, positionData: List[List[float]], start: Optional[int] = None
    ):
        try:
            tasks: List[Coroutine[Any, Any, Any]] = []

            tasks.append(
                client.execute(
                    MutEditPositionFrameResponse,
                    EDIT_POS_FRAME,
                    {
                        "input": MutEditPositionFrameInput(
                            frameId=id, positionData=positionData
                        )
                    },
                )
            )

            if start is not None:
                tasks.append(
                    client.execute(
                        MutEditPositionFrameTimeResponse,
                        EDIT_POS_FRAME_TIME,
                        {
                            "input": MutEditPositionFrameTimeInput(
                                frameID=id, start=start
                            )
                        },
                    )
                )

            await asyncio.gather(*tasks)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

    async def delete_frame(self, id: MapID) -> Optional[MapID]:
        try:
            response = await client.execute(
                MutDeletePositionFrameResponse,
                DELETE_POS_FRAME,
                {"input": MutDeletePositionFrameInput(frameID=id)},
            )
            return response["deletePositionFrame"].id

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def request_edit(self, id: MapID) -> Optional[bool]:
        try:
            response = await client.execute(
                MutRequestEditPositionResponse, REQUEST_EDIT_POS_BY_ID, {"frameId": id}
            )
            return response["RequestEditPosition"].ok

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def cancel_edit(self, id: MapID) -> Optional[bool]:
        try:
            response = await client.execute(
                MutCancelEditPositionResponse, CANCEL_EDIT_POS_BY_ID, {"frameId": id}
            )
            return response["CancelEditPosition"].ok

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None


pos_agent = PosAgent()
