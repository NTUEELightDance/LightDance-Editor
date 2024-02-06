from typing import List, Tuple

import bpy

from ..core.actions.property.lights import (
    update_current_alpha,
    update_current_color,
    update_current_effect,
)
from ..core.states import state
from ..icons import icon_collections
from .types import ColorPaletteItemType, LightType, ObjectType


def get_color_lists(
    self: bpy.types.Object, context: bpy.types.Context
) -> List[
    Tuple[str, str, str, str, int]
    | Tuple[str, str, str, int, int]
    | Tuple[str, str, str]
]:
    collection = icon_collections["main"]

    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == ObjectType.LIGHT.value:
        ld_color_palette: List[ColorPaletteItemType] = getattr(
            bpy.context.window_manager, "ld_color_palette"
        )
        return [
            (
                color.color_name,
                color.color_name,
                "",
                collection[color.color_name].icon_id,  # type: ignore
                color.color_id,
            )
            for color in ld_color_palette
        ]

    return []


def get_effect_lists(
    self: bpy.types.Object, context: bpy.types.Context
) -> List[Tuple[str, str, str, str, int] | Tuple[str, str, str]]:
    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == ObjectType.LIGHT.value:
        ld_model_name: str = getattr(self, "ld_model_name")
        ld_part_name: str = getattr(self, "ld_part_name")
        effect_lists = [
            (effect.name, effect.name, "", "", effect.id)
            for effect in state.led_map[ld_model_name][ld_part_name].values()
        ]

        effect_lists.insert(0, ("no-change", "no-change", "", "", -1))
        return effect_lists  # pyright: ignore

    return []


def register():
    setattr(
        bpy.types.Object,
        "ld_light_type",
        bpy.props.EnumProperty(
            name="LightType",
            description="Type of light",
            items=[  # pyright: ignore
                (LightType.FIBER.value, "Fiber", "", "", 0),
                (LightType.LED.value, "LED", "", "", 1),
                (LightType.LED_BULB.value, "LED Bulb", "", "", 2),
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
        "ld_color_float",
        bpy.props.FloatVectorProperty(
            name="Color float",
            description="Part fiber color",
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
        "ld_led_pos",
        bpy.props.IntProperty(
            name="LED Position",
            description="Position of LED",
            min=0,
            default=0,
        ),
    )

    setattr(
        bpy.types.Object,
        "ld_alpha",
        bpy.props.IntProperty(
            name="Alpha",
            description="Alpha of light",
            min=1,
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
