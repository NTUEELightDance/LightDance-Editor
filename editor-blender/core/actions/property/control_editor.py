from typing import Dict, Optional, cast

import bpy

from ....properties.types import LightType, ObjectType
from ...models import EditMode
from ...states import state


def update_multi_select_effect(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
):
    if state.edit_state != EditMode.EDITING:
        return

    multi_select: bool = getattr(self, "multi_select")
    if not multi_select:
        return

    effect_name: str = getattr(self, "multi_select_effect")

    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)
    for obj_name in state.selected_obj_names:
        obj = data_objects[obj_name]
        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type != ObjectType.LIGHT.value:
            continue

        ld_light_type: str = getattr(obj, "ld_light_type")
        if ld_light_type != LightType.LED.value:
            continue

        setattr(obj, "ld_effect", effect_name)


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
