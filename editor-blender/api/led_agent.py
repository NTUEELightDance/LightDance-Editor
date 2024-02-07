import asyncio
from dataclasses import dataclass
from typing import List, Optional, Tuple

from ..client import client
from ..core.models import ID, ColorID, LEDEffectID, LEDMap, ModelName, PartName
from ..core.utils.convert import led_map_query_to_state
from ..graphqls.mutations import (
    ADD_LED_EFFECT,
    DELETE_LED_EFFECT,
    EDIT_LED_EFFECT,
    MutAddLEDEffectInput,
    MutAddLEDEffectResponse,
    MutDeleteLEDEffectResponse,
    MutEditLEDEffectInput,
    MutEditLEDEffectResponse,
    MutLEDEffectFramePayload,
)
from ..graphqls.queries import GET_LED_MAP, QueryLEDMapData


@dataclass
class LEDAgent:
    async def get_led_map(self) -> Optional[LEDMap]:
        try:
            response = await client.execute(QueryLEDMapData, GET_LED_MAP)
            ledMap = response["LEDMap"]

            return led_map_query_to_state(ledMap.LEDMap)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def add_led_effect(
        self,
        name: str,
        model_name: ModelName,
        part_name: PartName,
        leds: List[Tuple[ColorID, int]],
    ) -> Optional[MutAddLEDEffectResponse]:
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

        except Exception as e:
            print(e)

        return None

    async def edit_led_effect(
        self, id: ID, name: str, leds: List[Tuple[ColorID, int]]
    ) -> Optional[MutEditLEDEffectResponse]:
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

        except Exception as e:
            print(e)

        return None

    async def delete_led_effect(
        self, id: LEDEffectID
    ) -> Optional[MutDeleteLEDEffectResponse]:
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

        except Exception as e:
            print(e)

        return None


led_agent = LEDAgent()
