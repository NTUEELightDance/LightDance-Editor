import asyncio
from collections.abc import Coroutine
from dataclasses import dataclass
from typing import Any

from ..client import client
from ..core.log import logger
from ..core.models import ColorID, ControlMap, ControlRecord, LEDEffectID, MapID
from ..core.utils.convert import control_map_query_to_state
from ..schemas.mutations import (
    ADD_CONTROL_FRAME,
    CANCEL_EDIT_CONTROL_BY_ID,
    DELETE_CONTROL_FRAME,
    EDIT_CONTROL_FRAME,
    EDIT_CONTROL_FRAME_TIME,
    REQUEST_EDIT_CONTROL_BY_ID,
    MutCancelEditControlResponse,
    MutDancerLEDStatusPayload,
    MutDancerStatusPayload,
    MutDeleteControlFrameInput,
    MutEditControlFrameInput,
    MutEditControlFrameTimeInput,
    MutRequestEditControlResponse,
)
from ..schemas.queries import (
    GET_CONTROL_MAP,
    GET_CONTROL_RECORD,
    QueryControlMapData,
    QueryControlMapPayload,
    QueryControlRecordData,
)


@dataclass
class ControlAgent:
    async def get_control_record(self) -> ControlRecord | None:
        """Get the control record from the server."""
        try:
            response = await client.execute(
                QueryControlRecordData,
                GET_CONTROL_RECORD,
            )
            controlRecord = response["controlFrameIDs"]

            return controlRecord

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get control record")

        return None

    async def get_control_map_payload(self) -> QueryControlMapPayload | None:
        """Get the control map raw payload from the server"""
        try:
            response = await client.execute(QueryControlMapData, GET_CONTROL_MAP)
            controlMap = response["ControlMap"]

            return controlMap.frameIds

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get control map payload")

        return None

    async def get_control_map(self) -> ControlMap | None:
        """Get the control map from the server."""
        try:
            response = await client.execute(QueryControlMapData, GET_CONTROL_MAP)
            controlMap = response["ControlMap"]

            return control_map_query_to_state(controlMap.frameIds)

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get control map")

        return None

    async def add_frame(
        self,
        start: int,
        fade: bool,
        controlData: list[MutDancerStatusPayload],
        ledControlData: list[MutDancerLEDStatusPayload],
    ) -> str | None:
        """Add a new control frame to the control map."""
        try:
            response = await client.execute(
                str,
                ADD_CONTROL_FRAME,
                {
                    "start": start,
                    "controlData": controlData,
                    "fade": fade,
                    "ledControlData": ledControlData,
                },
            )
            return response["addControlFrame"]

        except asyncio.CancelledError:
            pass

        except Exception as err:
            logger.exception("Failed to add control frame")
            raise err

    # TODO: Support only change fade
    async def save_frame(
        self,
        id: MapID,
        controlData: list[MutDancerStatusPayload],
        ledControlData: list[MutDancerLEDStatusPayload],
        fade: bool | None = None,
        start: int | None = None,
    ):
        """Edit a control frame in the control map."""
        try:
            tasks: list[Coroutine[Any, Any, Any]] = []

            tasks.append(
                client.execute(
                    str,
                    EDIT_CONTROL_FRAME,
                    {
                        "input": MutEditControlFrameInput(
                            frameId=id,
                            controlData=controlData,
                            ledBulbData=ledControlData,
                            fade=fade,
                        )
                    },
                )
            )

            if start is not None:
                tasks.append(
                    client.execute(
                        str,
                        EDIT_CONTROL_FRAME_TIME,
                        {
                            "input": MutEditControlFrameTimeInput(
                                frameId=id, start=start
                            )
                        },
                    )
                )

            await asyncio.gather(*tasks)

        except asyncio.CancelledError:
            pass

        except Exception as err:
            logger.exception("Failed to save control frame")
            raise err

    async def delete_frame(self, id: MapID) -> str | None:
        """Delete a control frame from the control map."""
        try:
            response = await client.execute(
                str,
                DELETE_CONTROL_FRAME,
                {"input": MutDeleteControlFrameInput(frameID=id)},
            )
            return response["deleteControlFrame"]

        except asyncio.CancelledError:
            pass

        except Exception as err:
            logger.exception("Failed to delete control frame")
            raise err

    async def request_edit(self, id: MapID) -> bool | None:
        """Request to edit a control frame.
        Returns True if the request is successful, the server will prevent other users from editing the frame.
        Returns False if other users are editing the frame.
        """
        try:
            response = await client.execute(
                MutRequestEditControlResponse,
                REQUEST_EDIT_CONTROL_BY_ID,
                {"frameId": id},
            )
            return response["RequestEditControl"].ok

        except asyncio.CancelledError:
            pass

        except Exception as err:
            logger.exception("Failed to request edit control frame")
            raise err

    async def cancel_edit(self, id: MapID) -> bool | None:
        """Cancel the edit request of the control frame."""
        try:
            response = await client.execute(
                MutCancelEditControlResponse, CANCEL_EDIT_CONTROL_BY_ID, {"frameId": id}
            )
            return response["CancelEditControl"].ok

        except asyncio.CancelledError:
            pass

        except Exception as err:
            logger.exception("Failed to cancel edit control frame")
            raise err


control_agent = ControlAgent()
