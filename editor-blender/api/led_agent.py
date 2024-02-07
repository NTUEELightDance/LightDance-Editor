import asyncio
from dataclasses import dataclass
from typing import Optional

from ..client import client
from ..core.models import LEDMap
from ..core.utils.convert import led_map_query_to_state
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


led_agent = LEDAgent()
