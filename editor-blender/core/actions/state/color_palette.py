import bpy

from ....api.color_agent import color_agent
from ....icons import generate_icon_images
from ....properties.types import ColorPaletteItemType
from ...models import RGB, ColorID, ColorMap, ColorName
from ...utils.convert import rgb_to_float


async def delete_color(id: ColorID):
    result = await color_agent.delete_color(id)
    result = result["deleteColor"]
    if not result.ok:
        raise Exception(result.msg)
    return result


async def add_color(name: ColorName, rgb: RGB):
    result = await color_agent.add_color(name, rgb)
    return result["addColor"]


async def edit_color(id: ColorID, name: ColorName, rgb: RGB):
    result = await color_agent.edit_color(id, name, rgb)
    return result["editColor"]


def setup_color_palette_from_state(colormap: ColorMap):
    getattr(bpy.context.window_manager, "ld_color_palette").clear()

    for id, color in colormap.items():
        item: ColorPaletteItemType = getattr(
            bpy.context.window_manager, "ld_color_palette"
        ).add()
        item.color_id = id
        item.color_name = color.name
        item.color_rgb = color.rgb

        color_float = rgb_to_float(color.rgb)
        item.color_float = (color_float[0], color_float[1], color_float[2])
        item.color_alpha = 1.0
        item.color_code = color.color_code

    color_temp_item: ColorPaletteItemType = getattr(
        bpy.context.window_manager, "ld_color_palette_temp"
    )
    color_temp_item.color_rgb = (0, 0, 0)
    color_temp_item.color_float = (0.0, 0.0, 0.0)

    setattr(color_temp_item, "color_name", "")

    generate_icon_images(list(colormap.values()), clear=True)
