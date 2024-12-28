import asyncio
import traceback
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
    async def get_color_map(self) -> ColorMap | None:
        """Get the color map from the server."""
        try:
            response = await client.execute(QueryColorMapData, GET_COLOR_MAP)
            colorMap = response["colorMap"]

            return color_map_query_to_state(colorMap.colorMap)

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def add_color(
        self, color_name: ColorName, color_rgb: RGB
    ) -> MutAddColorResponse | None:
        """Add a new color to the color palette.

        Args:
            color_name (ColorName): The color's name.
            color_rgb (RGB): The 3-tuple RGB color (0~255).
        """
        try:
            variable = {
                "color": ColorCreateInput(
                    color=color_name,
                    colorCode=ColorCreatecolorCodeInput(set=color_rgb),
                    autoCreateEffect=True,
                )
            }
            response = await client.execute(MutAddColorResponse, ADD_COLOR, variable)
            return response["addColor"]

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None

    async def edit_color(
        self, color_id: ColorID, color_name: ColorName, color_rgb: RGB
    ) -> MutEditColorResponse | None:
        """Edit a color in the color palette.

        Args:
            color_id (ColorID): The color's ID.
            color_name (ColorName): The color's name.
            color_rgb (RGB): The 3-tuple RGB color (0~255).
        """
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

        except Exception:
            traceback.print_exc()

        return None

    async def delete_color(self, color_id: ColorID) -> MutDeleteColorResponse | None:
        """Delete a color from the color palette."""
        try:
            variable = {"deleteColorId": color_id}
            response = await client.execute(
                MutDeleteColorResponse, DELETE_COLOR, variable
            )
            return response["deleteColor"]

        except asyncio.CancelledError:
            pass

        except Exception:
            traceback.print_exc()

        return None


color_agent = ColorAgent()
