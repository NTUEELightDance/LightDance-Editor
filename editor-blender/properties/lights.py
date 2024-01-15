from typing import List, Tuple

import bpy

from ..core.actions.property.lights import (
    update_current_alpha,
    update_current_color,
    update_current_effect,
)


def get_color_lists(
    self: bpy.types.Object, context: bpy.types.Context
) -> List[Tuple[str, str, str, str, int] | Tuple[str, str, str]]:
    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == "fiber":
        # TODO: Get colors from states
        return []

    return []


def get_effect_lists(
    self: bpy.types.Object, context: bpy.types.Context
) -> List[Tuple[str, str, str, str, int] | Tuple[str, str, str]]:
    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == "led":
        ld_dancer_name: str = getattr(self, "ld_dancer_name")
        ld_part_name: str = getattr(self, "ld_part_name")
        # TODO: Get effects from states
        return []

    return []


def register():
    setattr(
        bpy.types.Object,
        "ld_light_type",
        bpy.props.EnumProperty(
            name="LightType",
            description="Type of light",
            items=[  # pyright: ignore
                ("fiber", "Fiber", "", "", 0),
                ("led", "LED", "", "", 1),
            ],
        ),
    )

    setattr(
        bpy.types.Object,
        "ld_color",
        bpy.props.EnumProperty(
            name="Color",
            description="Part fiber color",
            items=get_color_lists,
            update=update_current_color,
        ),
    )
    setattr(
        bpy.types.Object,
        "ld_effect",
        bpy.props.EnumProperty(
            name="Effect",
            description="Part LED effect",
            items=get_effect_lists,
            update=update_current_effect,
        ),
    )

    setattr(
        bpy.types.Object,
        "ld_alpha",
        bpy.props.IntProperty(
            name="Alpha",
            description="Alpha of light",
            min=0,
            max=255,
            default=128,
            update=update_current_alpha,
        ),
    )

    # Properties for the states


def unregister():
    delattr(bpy.types.Object, "ld_light_type")
    delattr(bpy.types.Object, "ld_effect")
    delattr(bpy.types.Object, "ld_color")

    # Properties for the states
