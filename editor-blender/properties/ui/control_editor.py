from typing import List, Tuple

import bpy

from ...core.actions.property.control_editor import (
    update_multi_select_alpha,
    update_multi_select_color,
)
from ...icons import icon_collections
from ..types import ColorPaletteItemType, ObjectType


def get_color_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context
) -> List[Tuple[str, str, str, str, int] | Tuple[str, str, str]]:
    collection = icon_collections["main"]

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


def get_show_fiber(self: bpy.types.PropertyGroup) -> bool:
    return self["show_fiber"]


def set_show_fiber(self: bpy.types.PropertyGroup, value: bool) -> None:
    if value:
        self["show_fiber"] = value
        self["show_led"] = False
        self["show_all"] = False


def get_show_led(self: bpy.types.PropertyGroup) -> bool:
    return self["show_led"]


def set_show_led(self: bpy.types.PropertyGroup, value: bool) -> None:
    if value:
        self["show_fiber"] = False
        self["show_led"] = value
        self["show_all"] = False


def get_show_all(self: bpy.types.PropertyGroup) -> bool:
    return self["show_all"]


def set_show_all(self: bpy.types.PropertyGroup, value: bool) -> None:
    if value:
        self["show_fiber"] = False
        self["show_led"] = False
        self["show_all"] = value


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
        get=get_show_fiber,
        set=set_show_fiber,
    )
    show_led: bpy.props.BoolProperty(  # type: ignore
        name="Show LED",
        description="Show LED",
        get=get_show_led,
        set=set_show_led,
    )
    show_all: bpy.props.BoolProperty(  # type: ignore
        name="Show All",
        description="Show All",
        get=get_show_all,
        set=set_show_all,
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
