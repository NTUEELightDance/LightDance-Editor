from typing import List, Tuple

import bpy

from ...core.actions.property.control_editor import (
    update_multi_select_alpha,
    update_multi_select_color,
)
from ...core.actions.property.led_editor import (
    update_show_all,
    update_show_fiber,
    update_show_led,
)
from ..types import ColorPaletteItemType, ObjectType


def get_color_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
) -> List[Tuple[str, str, str, str, int] | Tuple[str, str, str]]:
    ld_color_palette: List[ColorPaletteItemType] = getattr(
        bpy.context.window_manager, "ld_color_palette"
    )
    color_list = [
        (color.color_name, color.color_name, "", "", color.color_id)
        for color in ld_color_palette
    ]

    return color_list  # pyright: ignore


class ControlEditorStatus(bpy.types.PropertyGroup):
    """Status of the PosEditor"""

    multi_select: bpy.props.BoolProperty(  # type: ignore
        name="Multi Select",
        description="Multi select",
        default=False,
    )
    multi_select_color: bpy.props.EnumProperty(  # type: ignore
        name="Multi Select Color",
        description="Color of multi select",
        items=get_color_lists,
        default=0,  # pyright: ignore
        update=update_multi_select_color,
    )
    multi_select_alpha: bpy.props.IntProperty(  # type: ignore
        name="Multi Select Alpha",
        description="Alpha of multi select",
        min=1,
        max=255,
        update=update_multi_select_alpha,
    )

    show_fiber: bpy.props.BoolProperty(  # type: ignore
        name="Show Fiber",
        description="Show Fiber",
        default=True,
        update=update_show_fiber,
    )
    show_led: bpy.props.BoolProperty(  # type: ignore
        name="Show LED",
        description="Show LED",
        default=False,
        update=update_show_led,
    )
    show_all: bpy.props.BoolProperty(  # type: ignore
        name="Show All",
        description="Show All",
        default=False,
        update=update_show_all,
    )


def register():
    bpy.utils.register_class(ControlEditorStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_control_editor",
        bpy.props.PointerProperty(type=ControlEditorStatus),
    )


def unregister():
    bpy.utils.unregister_class(ControlEditorStatus)
    delattr(bpy.types.WindowManager, "ld_ui_control_editor")