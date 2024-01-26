from dataclasses import dataclass

from ..client import client
from ..core.models import ControlMap, ControlRecord, MapID
from ..core.utils.convert import control_map_query_to_state
from ..graphqls.mutations import (
    CANCEL_EDIT_CONTROL_BY_ID,
    DELETE_CONTROL_FRAME,
    REQUEST_EDIT_CONTROL_BY_ID,
    MutCancelEditControlResponse,
    MutDeleteControlFrameInput,
    MutRequestEditControlResponse,
)
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

    # TODO: add control frame

    # TODO: save control frame

    async def delete_frame(self, id: MapID) -> str:
        response = await client.execute(
            str,
            DELETE_CONTROL_FRAME,
            {"input": MutDeleteControlFrameInput(frameID=id)},
        )
        return response["deleteControlFrame"]

    async def request_edit(self, id: MapID) -> bool:
        response = await client.execute(
            MutRequestEditControlResponse, REQUEST_EDIT_CONTROL_BY_ID, {"frameId": id}
        )
        return response["RequestEditControl"].ok

    async def cancel_edit(self, id: MapID) -> bool:
        response = await client.execute(
            MutCancelEditControlResponse, CANCEL_EDIT_CONTROL_BY_ID, {"frameId": id}
        )
        return response["CancelEditControl"].ok


control_agent = ControlAgent()
