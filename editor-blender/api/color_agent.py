from dataclasses import dataclass

from ..client import client
from ..core.models import ColorMap
from ..core.utils.convert import color_map_query_to_state
from ..graphqls.queries import GET_COLOR_MAP, QueryColorMapData


@dataclass
class ColorAgent:
    async def get_color_map(self) -> ColorMap:
        response = await client.execute(QueryColorMapData, GET_COLOR_MAP)
        colorMap = response["colorMap"]

        return color_map_query_to_state(colorMap.colorMap)


color_agent = ColorAgent()
