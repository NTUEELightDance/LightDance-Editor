from typing import Optional

import bpy

from ...models import EditMode
from ...states import state


def update_multi_select_color(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
):
    if state.edit_state != EditMode.EDITING:
        return

    multi_select: bool = getattr(self, "multi_select")
    if not multi_select:
        return

    # TODO: Update ld_color of all selected fibers
    color: str = getattr(self, "multi_select_color")
    for obj_name in state.selected_obj_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(obj_name)
        if obj is not None:
            setattr(obj, "ld_color", color)


def update_multi_select_alpha(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
):
    if state.edit_state != EditMode.EDITING:
        return

    multi_select: bool = getattr(self, "multi_select")
    if not multi_select:
        return

    alpha: int = getattr(self, "multi_select_alpha")
    for obj_name in state.selected_obj_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(obj_name)
        if obj is not None:
            setattr(obj, "ld_alpha", alpha)
