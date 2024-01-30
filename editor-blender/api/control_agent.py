import asyncio
from dataclasses import dataclass
from typing import Any, Coroutine, List, Optional, Tuple, Union

from ..client import client
from ..core.models import ColorID, ControlMap, ControlRecord, LEDEffectID, MapID
from ..core.utils.convert import control_map_query_to_state
from ..graphqls.mutations import (
    ADD_CONTROL_FRAME,
    CANCEL_EDIT_CONTROL_BY_ID,
    DELETE_CONTROL_FRAME,
    EDIT_CONTROL_FRAME,
    EDIT_CONTROL_FRAME_TIME,
    REQUEST_EDIT_CONTROL_BY_ID,
    MutCancelEditControlResponse,
    MutDeleteControlFrameInput,
    MutEditControlFrameInput,
    MutEditControlFrameTimeInput,
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

    async def add_frame(
        self,
        start: int,
        fade: bool,
        controlData: List[List[Tuple[Union[ColorID, LEDEffectID], int]]],
    ) -> str:
        response = await client.execute(
            str,
            ADD_CONTROL_FRAME,
            {"start": start, "controlData": controlData, "fade": fade},
        )
        return response["addControlFrame"]

    # TODO: Support only change fade
    async def save_frame(
        self,
        id: MapID,
        controlData: List[List[Tuple[Union[ColorID, LEDEffectID], int]]],
        fade: Optional[bool] = None,
        start: Optional[int] = None,
    ):
        tasks: List[Coroutine[Any, Any, Any]] = []

        tasks.append(
            client.execute(
                str,
                EDIT_CONTROL_FRAME,
                {
                    "input": MutEditControlFrameInput(
                        frameId=id, controlData=controlData, fade=fade
                    )
                },
            )
        )

        if start is not None:
            tasks.append(
                client.execute(
                    str,
                    EDIT_CONTROL_FRAME_TIME,
                    {"input": MutEditControlFrameTimeInput(frameID=id, start=start)},
                )
            )

        await asyncio.gather(*tasks)

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
