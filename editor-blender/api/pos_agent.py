from dataclasses import dataclass
from typing import List

from ..client import client
from ..core.models import MapID, PosMap, PosRecord
from ..core.utils.convert import pos_map_query_to_state
from ..graphqls.mutations import (
    ADD_POS_FRAME,
    CANCEL_EDIT_POS_BY_ID,
    DELETE_POS_FRAME,
    EDIT_POS_FRAME,
    REQUEST_EDIT_POS_BY_ID,
    MutAddPositionFrameResponse,
    MutCancelEditPositionResponse,
    MutDeletePositionFrameInput,
    MutDeletePositionFrameResponse,
    MutEditPositionFrameInput,
    MutEditPositionFrameResponse,
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
    async def get_pos_record(self) -> PosRecord:
        response = await client.execute(
            QueryPosRecordData,
            GET_POS_RECORD,
        )
        controlRecord = response["positionFrameIDs"]

        return controlRecord

    async def get_pos_map_payload(self) -> QueryPosMapPayload:
        response = await client.execute(QueryPosMapData, GET_POS_MAP)
        posMap = response["PosMap"]

        return posMap.frameIds

    async def get_pos_map(self) -> PosMap:
        response = await client.execute(QueryPosMapData, GET_POS_MAP)
        posMap = response["PosMap"]

        return pos_map_query_to_state(posMap.frameIds)

    async def add_frame(self, start: int, positionData: List[List[float]]) -> MapID:
        response = await client.execute(
            MutAddPositionFrameResponse,
            ADD_POS_FRAME,
            {"start": start, "positionData": positionData},
        )
        print(response)
        return response["addPositionFrame"].id

    async def save_frame(
        self, id: MapID, positionData: List[List[float]]
    ) -> List[MapID]:
        response = await client.execute(
            MutEditPositionFrameResponse,
            EDIT_POS_FRAME,
            {"input": MutEditPositionFrameInput(frameId=id, positionData=positionData)},
        )
        return response["editPosMap"].frameIds

    async def delete_frame(self, id: MapID) -> MapID:
        response = await client.execute(
            MutDeletePositionFrameResponse,
            DELETE_POS_FRAME,
            {"input": MutDeletePositionFrameInput(frameID=id)},
        )
        return response["deletePositionFrame"].id

    async def request_edit(self, id: MapID) -> bool:
        response = await client.execute(
            MutRequestEditPositionResponse,
            REQUEST_EDIT_POS_BY_ID,
            {"frameId": id},
        )
        return response["RequestEditPosition"].ok

    async def cancel_edit(self, id: MapID) -> bool:
        response = await client.execute(
            MutCancelEditPositionResponse,
            CANCEL_EDIT_POS_BY_ID,
            {"frameId": id},
        )
        return response["CancelEditPosition"].ok


pos_agent = PosAgent()
