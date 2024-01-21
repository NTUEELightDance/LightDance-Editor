from dataclasses import dataclass

from ..client import client
from ..core.models import ControlMap, ControlRecord
from ..core.utils.convert import control_map_query_to_state
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

    async def get_control_map(self) -> ControlMap:
        response = await client.execute(QueryControlMapData, GET_CONTROL_MAP)
        controlMap = response["ControlMap"]

        return control_map_query_to_state(controlMap.frameIds)


control_agent = ControlAgent()
