import asyncio
from collections.abc import Coroutine
from dataclasses import dataclass
from typing import Any

from ..client import client
from ..core.log import logger
from ..core.models import MapID, PosMap, PosRecord
from ..core.utils.convert import pos_map_query_to_state
from ..schemas.mutations import (
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
from ..schemas.queries import (
    GET_POS_MAP,
    GET_POS_RECORD,
    QueryPosMapData,
    QueryPosMapPayload,
    QueryPosRecordData,
)


@dataclass
class PosAgent:
    async def get_pos_record(self) -> PosRecord | None:
        """Get the position record from the server."""
        try:
            response = await client.execute(
                QueryPosRecordData,
                GET_POS_RECORD,
            )
            controlRecord = response["positionFrameIDs"]

            return controlRecord

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get position record")

    async def get_pos_map_payload(self) -> QueryPosMapPayload | None:
        """Get the position map raw payload from the server"""
        try:
            response = await client.execute(QueryPosMapData, GET_POS_MAP)
            posMap = response["PosMap"]

            return posMap.frameIds

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get position map payload")

    async def get_pos_map(self) -> PosMap | None:
        """Get the position map from the server."""
        try:
            response = await client.execute(QueryPosMapData, GET_POS_MAP)
            posMap = response["PosMap"]

            return pos_map_query_to_state(posMap.frameIds)

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to get position map")

    async def add_frame(
        self, start: int, positionData: list[list[float]], hasEffectData: list[bool]
    ) -> MapID | None:
        """Add a new position frame to the position map."""
        try:
            response = await client.execute(
                MutAddPositionFrameResponse,
                ADD_POS_FRAME,
                {
                    "start": start,
                    "positionData": positionData,
                    "hasEffectData": hasEffectData,
                },
            )
            return response["addPositionFrame"].id

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to add position frame")

    async def save_frame(
        self,
        id: MapID,
        positionData: list[list[float] | None],
        hasEffectData: list[bool],
        start: int | None = None,
    ):
        """Edit a position frame in the position map."""
        try:
            tasks: list[Coroutine[Any, Any, Any]] = []

            tasks.append(
                client.execute(
                    MutEditPositionFrameResponse,
                    EDIT_POS_FRAME,
                    {
                        "input": MutEditPositionFrameInput(
                            frameId=id,
                            positionData=positionData,
                            hasEffectData=hasEffectData,
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
                                frameId=id, start=start
                            )
                        },
                    )
                )

            await asyncio.gather(*tasks)

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to save position frame")

    async def delete_frame(self, id: MapID) -> MapID | None:
        """Delete a position frame from the position map."""
        try:
            response = await client.execute(
                MutDeletePositionFrameResponse,
                DELETE_POS_FRAME,
                {"input": MutDeletePositionFrameInput(frameID=id)},
            )
            return response["deletePositionFrame"].id

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to delete position frame")

    async def request_edit(self, id: MapID) -> bool | None:
        """Request to edit a position frame.
        Returns True if the request is successful, the server will prevent other users from editing the frame.
        Returns False if other users are editing the frame.
        """
        try:
            response = await client.execute(
                MutRequestEditPositionResponse, REQUEST_EDIT_POS_BY_ID, {"frameId": id}
            )
            return response["RequestEditPosition"].ok

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to request edit position frame")

    async def cancel_edit(self, id: MapID) -> bool | None:
        """Cancel the edit request of the position frame."""
        try:
            response = await client.execute(
                MutCancelEditPositionResponse, CANCEL_EDIT_POS_BY_ID, {"frameId": id}
            )
            return response["CancelEditPosition"].ok

        except asyncio.CancelledError:
            pass

        except Exception:
            logger.exception("Failed to cancel edit position frame")


pos_agent = PosAgent()
