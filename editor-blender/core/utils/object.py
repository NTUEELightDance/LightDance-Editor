from typing import Any

import bpy


def clear_selection():
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)  # type: ignore


def set_bpy_props(obj: bpy.types.Object, **props: Any):
    for key, value in props.items():
        setattr(obj, key, value)
