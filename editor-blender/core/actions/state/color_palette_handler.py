import bpy

from ....api.color_agent import color_agent


async def handle_color_delete(index: int):
    res = await color_agent.delete_color(index)
    return res["deleteColor"]


async def handle_color_confirm(editing_state):
    color_temp = getattr(bpy.context.window_manager, "ld_color_palette_temp")[0]
    if editing_state == "EDIT":
        response = await color_agent.edit_color(int(color_temp.color_id), str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["editColor"]
    elif editing_state == "NEW":
        response = await color_agent.add_color(str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["addColor"]  # type: ignore
