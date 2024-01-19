from dataclasses import dataclass

from ..client import client
from ..core.models import RGB, ColorID, ColorMap, ColorName
from ..core.utils.convert import color_map_query_to_state
from ..graphqls.mutations import (
    ADD_COLOR,
    DELETE_COLOR,
    EDIT_COLOR,
    ColorCreatecolorCodeInput,
    ColorCreateInput,
    ColorUpdatecolorCodeInput,
    ColorUpdateInput,
    MutAddColorResponse,
    MutDeleteColorResponse,
    MutEditColorResponse,
    StringFieldUpdateOperationsInput,
)
from ..graphqls.queries import GET_COLOR_MAP, QueryColorMapData


@dataclass
class ColorAgent:
    async def get_color_map(self) -> ColorMap:
        response = await client.execute(QueryColorMapData, GET_COLOR_MAP)
        colorMap = response["colorMap"]

        return color_map_query_to_state(colorMap.colorMap)

    async def add_color(self, color_name: ColorName, color_rgb: RGB):
        variable = {
            "color": ColorCreateInput(
                color=color_name, colorCode=ColorCreatecolorCodeInput(set=color_rgb)
            )
        }
        response = await client.execute(MutAddColorResponse, ADD_COLOR, variable)
        return response

    async def edit_color(
        self, color_id: ColorID, color_name: ColorName, color_rgb: RGB
    ):
        variable = {
            "data": ColorUpdateInput(
                colorCode=ColorUpdatecolorCodeInput(set=color_rgb),
                color=StringFieldUpdateOperationsInput(set=color_name),
            ),
            "editColorId": color_id,
        }
        response = await client.execute(MutEditColorResponse, EDIT_COLOR, variable)
        return response

    async def delete_color(self, color_id: ColorID):
        variable = {"deleteColorId": color_id}
        response = await client.execute(MutDeleteColorResponse, DELETE_COLOR, variable)
        return response


color_agent = ColorAgent()
