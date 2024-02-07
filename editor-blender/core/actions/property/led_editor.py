from typing import Optional

import bpy

from ...models import EditMode
from ...states import state


def update_edit_model(self: bpy.types.PropertyGroup, context: bpy.types.Context):
    dancer_name: str = getattr(self, "edit_dancer")
    dancer_obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)

    if dancer_obj is not None:
        dancer_obj.select_set(True)
        bpy.context.view_layer.objects.active = dancer_obj


def update_edit_dancer(self: bpy.types.PropertyGroup, context: bpy.types.Context):
    dancer_name: str = getattr(self, "edit_dancer")
    dancer_obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)

    if dancer_obj is not None:
        dancer_obj.select_set(True)
        bpy.context.view_layer.objects.active = dancer_obj


def update_edit_part(self: bpy.types.PropertyGroup, context: bpy.types.Context):
    dancer_index = self["edit_dancer"]

    part_obj_name = f"{dancer_index}_" + getattr(self, "edit_part")
    part_obj: Optional[bpy.types.Object] = bpy.data.objects.get(part_obj_name)

    if part_obj is not None:
        part_obj.select_set(True)
        bpy.context.view_layer.objects.active = part_obj


def update_multi_select_color(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
):
    if state.edit_state != EditMode.EDITING:
        return

    multi_select: bool = getattr(self, "multi_select")
    if not multi_select:
        return

    color: str = getattr(self, "multi_select_color")
    for obj_name in state.selected_obj_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(obj_name)
        if obj is not None:
            setattr(obj, "ld_color", color)
