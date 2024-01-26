from dataclasses import dataclass

from ..client import client
from ..core.models import LEDMap
from ..core.utils.convert import led_map_query_to_state
from ..graphqls.mutations import ADD_COLOR
from ..graphqls.queries import GET_LED_MAP, QueryLEDMapData


@dataclass
class LEDAgent:
    async def get_led_map(self) -> LEDMap:
        response = await client.execute(QueryLEDMapData, GET_LED_MAP)
        ledMap = response["LEDMap"]

        return led_map_query_to_state(ledMap.LEDMap)


led_agent = LEDAgent()
