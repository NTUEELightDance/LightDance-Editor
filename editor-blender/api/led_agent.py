import asyncio
import traceback
from dataclasses import dataclass

from ..client import client
from ..core.models import ID, ColorID, LEDEffectID, LEDMap, ModelName, PartName
from ..core.utils.convert import led_map_query_to_state
from ..schemas.mutations import (
    ADD_LED_EFFECT,
    CANCEL_EDIT_LED_EFFECT_BY_ID,
    DELETE_LED_EFFECT,
    EDIT_LED_EFFECT,
    REQUEST_EDIT_LED_EFFECT_BY_ID,
    MutAddLEDEffectInput,
    MutAddLEDEffectResponse,
    MutCancelEditLEDEffectResponse,
    MutDeleteLEDEffectResponse,
    MutEditLEDEffectInput,
    MutEditLEDEffectResponse,
    MutLEDEffectFramePayload,
    MutRequestEditLEDEffectResponse,
)
from ..schemas.queries import GET_LED_MAP, QueryLEDMapData


@dataclass
class LEDAgent:
    async def get_led_map(self) -> LEDMap | None:
        """Get the LED effect map from the server."""
        try:
            response = await client.execute(QueryLEDMapData, GET_LED_MAP)
            ledMap = response["LEDMap"]

            return led_map_query_to_state(ledMap.LEDMap)

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def add_led_effect(
        self,
        name: str,
        model_name: ModelName,
        part_name: PartName,
        leds: list[tuple[ColorID, int]],
    ) -> MutAddLEDEffectResponse | None:
        """Add a new LED effect to the server."""
        try:
            response = await client.execute(
                MutAddLEDEffectResponse,
                ADD_LED_EFFECT,
                variables={
                    "input": MutAddLEDEffectInput(
                        name=name,
                        modelName=model_name,
                        partName=part_name,
                        repeat=0,
                        frames=[
                            MutLEDEffectFramePayload(leds=leds, start=0, fade=False)
                        ],
                    )
                },
            )
            return response["addLEDEffect"]

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def save_led_effect(
        self, id: ID, name: str, leds: list[tuple[ColorID, int]]
    ) -> MutEditLEDEffectResponse | None:
        """Save the LED effect to the server."""
        try:
            response = await client.execute(
                MutEditLEDEffectResponse,
                EDIT_LED_EFFECT,
                variables={
                    "input": MutEditLEDEffectInput(
                        id=id,
                        name=name,
                        repeat=0,
                        frames=[
                            MutLEDEffectFramePayload(leds=leds, start=0, fade=False)
                        ],
                    )
                },
            )
            return response["editLEDEffect"]

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def request_edit(self, id: LEDEffectID) -> bool | None:
        """Request to edit a led effect.
        Returns True if the request is successful, the server will prevent other users from editing the effect.
        Returns False if other users are editing the effect.
        """
        try:
            response = await client.execute(
                MutRequestEditLEDEffectResponse,
                REQUEST_EDIT_LED_EFFECT_BY_ID,
                {"ledEffectId": id},
            )
            return response["RequestEditLEDEffect"].ok

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def cancel_edit(self, id: LEDEffectID) -> bool | None:
        """Cancel the edit request of the led effect."""
        try:
            response = await client.execute(
                MutCancelEditLEDEffectResponse,
                CANCEL_EDIT_LED_EFFECT_BY_ID,
                {"ledEffectId": id},
            )
            return response["CancelEditLEDEffect"].ok

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def delete_led_effect(
        self, id: LEDEffectID
    ) -> MutDeleteLEDEffectResponse | None:
        """Delete a led effect from the server."""
        try:
            response = await client.execute(
                MutDeleteLEDEffectResponse,
                DELETE_LED_EFFECT,
                variables={
                    "deleteLedEffectId": id,
                },
            )
            return response["deleteLEDEffect"]

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None


led_agent = LEDAgent()
