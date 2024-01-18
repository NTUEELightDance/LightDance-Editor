import bpy

from ....api.color_agent import color_agent
from ...models import ColorMap
from ...utils.convert import float_to_rgb, rgb_to_float


async def handle_color_delete(index: int):
    res = await color_agent.delete_color(index)
    return res["deleteColor"]


async def handle_color_confirm(editing_state):
    color_temp = getattr(bpy.context.window_manager, "ld_color_palette_temp")
    if editing_state == "EDIT":
        response = await color_agent.edit_color(int(color_temp.color_id), str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["editColor"]
    elif editing_state == "NEW":
        response = await color_agent.add_color(str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["addColor"]  # type: ignore


def lock_color_float_change(item, context):
    color_float = tuple(getattr(item, "color_float"))
    new_float = rgb_to_float(item.color_rgb)
    if color_float != new_float:
        setattr(item, "color_float", new_float)


def lock_color_rgb_change(item, context):
    color_rgb = tuple(getattr(item, "color_rgb"))
    new_rgb = float_to_rgb(item.color_float)
    if color_rgb != new_rgb:
        setattr(item, "color_rgb", new_rgb)


def setup_color_data_from_state(colormap: ColorMap):
    getattr(bpy.context.window_manager, "ld_color_palette").clear()
    for id, color in colormap.items():
        item = getattr(bpy.context.window_manager, "ld_color_palette").add()
        item.color_id = id
        item.color_name = color.name
        item.color_rgb = color.rgb
        item["color_float"] = rgb_to_float(color.rgb)
        item.color_alpha = 1.0
        item.color_code = color.color_code

    color_temp_item = getattr(bpy.context.window_manager, "ld_color_palette_temp")
    setattr(color_temp_item, "color_rgb", [0, 0, 0])
    setattr(
        color_temp_item, "color_float", [x / 255 for x in color_temp_item.color_rgb]
    )
    setattr(color_temp_item, "color_name", "")
