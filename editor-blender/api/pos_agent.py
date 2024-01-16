from dataclasses import dataclass

from ..client import client
from ..core.models import PosRecord
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


pos_agent = PosAgent()
