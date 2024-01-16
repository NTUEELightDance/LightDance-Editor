from dataclasses import dataclass

from ..client import client
from ..core.models import ControlRecord
from ..graphqls.queries import (
    GET_CONTROL_MAP,
    GET_CONTROL_RECORD,
    QueryControlMapData,
    QueryControlMapPayload,
    QueryControlRecordData,
)


@dataclass
class ControlAgent:
    async def get_control_record(self) -> ControlRecord:
        response = await client.execute(
            QueryControlRecordData,
            GET_CONTROL_RECORD,
        )
        controlRecord = response["controlFrameIDs"]

        return controlRecord

    async def get_control_map_payload(self) -> QueryControlMapPayload:
        response = await client.execute(QueryControlMapData, GET_CONTROL_MAP)
        controlMap = response["ControlMap"]

        return controlMap.frameIds


control_agent = ControlAgent()
