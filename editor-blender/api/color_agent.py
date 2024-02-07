import asyncio
from dataclasses import dataclass
from typing import Optional

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
    async def get_color_map(self) -> Optional[ColorMap]:
        try:
            response = await client.execute(QueryColorMapData, GET_COLOR_MAP)
            colorMap = response["colorMap"]

            return color_map_query_to_state(colorMap.colorMap)

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def add_color(
        self, color_name: ColorName, color_rgb: RGB
    ) -> Optional[MutAddColorResponse]:
        try:
            variable = {
                "color": ColorCreateInput(
                    color=color_name, colorCode=ColorCreatecolorCodeInput(set=color_rgb)
                )
            }
            response = await client.execute(MutAddColorResponse, ADD_COLOR, variable)
            return response["addColor"]

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def edit_color(
        self, color_id: ColorID, color_name: ColorName, color_rgb: RGB
    ) -> Optional[MutEditColorResponse]:
        try:
            variable = {
                "data": ColorUpdateInput(
                    colorCode=ColorUpdatecolorCodeInput(set=color_rgb),
                    color=StringFieldUpdateOperationsInput(set=color_name),
                ),
                "editColorId": color_id,
            }
            response = await client.execute(MutEditColorResponse, EDIT_COLOR, variable)
            return response["editColor"]

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None

    async def delete_color(self, color_id: ColorID) -> Optional[MutDeleteColorResponse]:
        try:
            variable = {"deleteColorId": color_id}
            response = await client.execute(
                MutDeleteColorResponse, DELETE_COLOR, variable
            )
            return response["deleteColor"]

        except asyncio.CancelledError:
            pass

        except Exception as e:
            print(e)

        return None


color_agent = ColorAgent()
