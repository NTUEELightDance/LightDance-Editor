from dataclasses import dataclass

from ..client import client
from ..core.models import ColorMap, ColorName, ColorID, RGB
from ..core.utils.convert import color_map_query_to_state
from ..graphqls.queries import GET_COLOR_MAP, QueryColorMapData
from ..graphqls.mutations import ADD_COLOR, DELETE_COLOR, EDIT_COLOR, ColorCreatecolorCodeInput, MutAddColorResponse, ColorCreateInput, MutDeleteColorResponse, MutEditColorResponse


@dataclass
class ColorAgent:
    async def get_color_map(self) -> ColorMap:
        response = await client.execute(QueryColorMapData, GET_COLOR_MAP)
        colorMap = response["colorMap"]

        return color_map_query_to_state(colorMap.colorMap)
    
    async def add_color(self, color_name: ColorName, color_rgb: RGB):
        variable: dict[str, ColorCreateInput] = {
            "color": ColorCreateInput(
                color=color_name,
                colorCode=ColorCreatecolorCodeInput(set=color_rgb)
            )
        }
        response = await client.execute(MutAddColorResponse, ADD_COLOR, variable)
        print(response)
        return response
    
    async def edit_color(self, color_id: ColorID, color_name: ColorName, color_rgb: RGB):
        # TODO: types
        variable = {
            "data": {
                "colorCode": {
                    "set": color_rgb
                },
                "color": {
                    "set": color_name
                }
            },
            "editColorId": color_id
        }   
        response = await client.execute(MutEditColorResponse, EDIT_COLOR, variable)
        print(response)
        return response
    
    async def delete_color(self, color_id: ColorID):
        # TODO: types
        variable = {
        "deleteColorId": color_id
        }
        response = await client.execute(MutDeleteColorResponse, DELETE_COLOR, variable)
        print(response)
        return response

color_agent = ColorAgent()
