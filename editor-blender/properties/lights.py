from typing import Dict, List, Tuple, cast

import bpy

from ..core.actions.property.lights import (
    update_current_alpha,
    update_current_color,
    update_current_effect,
)
from ..core.models import EditMode, FiberData, LEDData
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
        color_list = [
            (
                color.color_name,
                color.color_name,
                "",
                # cast(Dict[str, bpy.types.ImagePreview], collection)[
                #     color.color_name
                # ].icon_id,
                "",
                color.color_id,
            )
            for color in ld_color_palette
        ]
        color_list.sort(key=lambda x: x[1])

        return color_list  # pyright: ignore

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
        effect_lists.sort(key=lambda x: x[1])

        effect_lists.insert(0, ("no-change", "no-change", "", "", -1))
        return effect_lists  # pyright: ignore

    return []


# def get_color(self: bpy.types.Object) -> int:
#     if not state.ready:
#         return 0
#
#     if state.edit_state == EditMode.EDITING:
#         return cast(int, self.get("ld_color", 0))
#
#     ld_object_type: str = getattr(self, "ld_object_type")
#     if ld_object_type == ObjectType.LIGHT.value:
#         frame_index = state.current_control_index
#         frame_id = state.control_record[frame_index]
#
#         ld_dancer_name: str = getattr(self, "ld_dancer_name")
#         ld_part_name: str = getattr(self, "ld_part_name")
#
#         status = state.control_map[frame_id].status[ld_dancer_name][ld_part_name]
#         color_id = cast(FiberData, status).color_id
#
#         self["ld_color"] = color_id
#         return color_id
#
#     return 0


# def set_color(self: bpy.types.Object, value: int) -> None:
#     self["ld_color"] = value


# def get_effect(self: bpy.types.Object) -> int:
#     if not state.ready:
#         return 0
#
#     if state.edit_state == EditMode.EDITING:
#         return cast(int, self.get("ld_effect", 0))
#
#     ld_object_type: str = getattr(self, "ld_object_type")
#     if ld_object_type == ObjectType.LIGHT.value:
#         frame_index = state.current_control_index
#         frame_id = state.control_record[frame_index]
#
#         ld_dancer_name: str = getattr(self, "ld_dancer_name")
#         ld_part_name: str = getattr(self, "ld_part_name")
#
#         status = state.control_map[frame_id].status[ld_dancer_name][ld_part_name]
#         return cast(LEDData, status).effect_id
#
#     return 0


# def set_effect(self: bpy.types.Object, value: int) -> None:
#     self["ld_effect"] = value


# def get_alpha(self: bpy.types.Object) -> int:
#     if not state.ready:
#         return 1
#
#     if state.edit_state == EditMode.EDITING:
#         return cast(int, self.get("ld_alpha", 1))
#
#     ld_object_type: str = getattr(self, "ld_object_type")
#     if ld_object_type == ObjectType.LIGHT.value:
#         frame_index = state.current_control_index
#         frame_id = state.control_record[frame_index]
#
#         ld_dancer_name: str = getattr(self, "ld_dancer_name")
#         ld_part_name: str = getattr(self, "ld_part_name")
#
#         status = state.control_map[frame_id].status[ld_dancer_name][ld_part_name]
#         return status.alpha
#
#     return 1


# def set_alpha(self: bpy.types.Object, value: int) -> None:
#     self["ld_alpha"] = value


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
            # get=get_color,
            # set=set_color,
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
            # get=get_effect,
            # set=set_effect,
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
            default=150,
            # get=get_alpha,
            # set=set_alpha,
            update=update_current_alpha,
        ),
    )

    # Properties for the states


def unregister():
    delattr(bpy.types.Object, "ld_light_type")
    delattr(bpy.types.Object, "ld_effect")
    delattr(bpy.types.Object, "ld_color")

    # Properties for the states
