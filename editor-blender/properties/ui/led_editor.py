import bpy

from ...core.actions.property.led_editor import (
    update_edit_dancer,
    update_edit_effect,
    update_edit_model,
    update_edit_part,
    update_multi_select_color,
)
from ...core.models import PartType
from ...core.states import state
from ..types import ColorPaletteItemType
from .types import LEDEditorEditModeType


def get_model_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    model_list = []
    if get_edit_model(self) == -1:
        model_list.append(("NONE", "", "", "", -1))

    for index, model_name in enumerate(state.model_names):
        model_list.append((model_name, model_name, "", "POSE_HLT", index))

    return model_list  # pyright: ignore


def get_edit_model(self: bpy.types.PropertyGroup) -> int:
    return self["edit_model"]


def set_edit_model(self: bpy.types.PropertyGroup, value: int):
    if self["edit_model"] != value:
        self["edit_model"] = value
        # Default select first dancer
        self["edit_dancer"] = 0
        self["edit_part"] = -1
        self["edit_effect"] = -1


def get_dancer_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    dancer_list = []
    if get_edit_dancer(self) == -1:
        dancer_list.append(("NONE", "", "", "", -1))

    model_name = getattr(self, "edit_model")

    if model_name == "NONE":
        return dancer_list  # pyright: ignore

    model_dancers = state.models[model_name]

    for dancer_name in model_dancers:
        index = state.dancer_part_index_map[dancer_name].index
        if bpy.data.objects.get(dancer_name) is not None:
            dancer_list.append((dancer_name, dancer_name, "", "OBJECT_DATA", index))

    return dancer_list  # pyright: ignore


def get_edit_dancer(self: bpy.types.PropertyGroup) -> int:
    return self["edit_dancer"]


def set_edit_dancer(self: bpy.types.PropertyGroup, value: int):
    if self["edit_dancer"] != value:
        self["edit_dancer"] = value
        self["edit_part"] = -1
        self["edit_effect"] = -1


def get_part_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    part_list = []
    if get_edit_part(self) == -1:
        part_list.append(("NONE", "", "", "", -1))

    dancer_name = getattr(self, "edit_dancer")

    if dancer_name == "NONE":
        return part_list  # pyright: ignore

    dancer_parts = state.dancers[dancer_name]

    for index, part_name in enumerate(dancer_parts):
        part_type = state.part_type_map[part_name]
        if part_type != PartType.LED:
            continue

        part_list.append((part_name, part_name, "", "OBJECT_DATA", index))

    return part_list  # pyright: ignore


def get_edit_part(self: bpy.types.PropertyGroup) -> int:
    return self["edit_part"]


def set_edit_part(self: bpy.types.PropertyGroup, value: int):
    if self["edit_part"] != value:
        self["edit_part"] = value
        self["edit_effect"] = -1


def get_edit_effect(self: bpy.types.PropertyGroup) -> int:
    if "edit_effect" in self:
        return self["edit_effect"]
    else:
        return -1


def set_edit_effect(self: bpy.types.PropertyGroup, value: int):
    if self["edit_effect"] != value:
        self["edit_effect"] = value


def get_effect_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    effect_list = []
    if get_edit_effect(self) == -1:
        effect_list.append(("NONE", "", "", "", -1))

    model_name = getattr(self, "edit_model")
    dancer_name = getattr(self, "edit_dancer")
    part_name = getattr(self, "edit_part")

    if dancer_name == "NONE" or part_name == "NONE":
        return effect_list  # pyright: ignore

    effects = state.led_map[model_name][part_name]
    for effect_name, effect in effects.items():
        effect_list.append((effect_name, effect_name, "", "MATERIAL", effect.id))

    return effect_list  # pyright: ignore


def get_color_lists(
    self: bpy.types.PropertyGroup, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    if not bpy.context:
        return []
    ld_color_palette: list[ColorPaletteItemType] = getattr(
        bpy.context.window_manager, "ld_color_palette"
    )
    color_list = [
        (color.color_name, color.color_name, "", "MATERIAL", color.color_id)
        for color in ld_color_palette
    ]

    return color_list  # pyright: ignore


class LEDEditorStatus(bpy.types.PropertyGroup):
    """Status of the PosEditor"""

    edit_mode: bpy.props.EnumProperty(  # type: ignore
        items=[
            (LEDEditorEditModeType.IDLE.value, "", ""),
            (LEDEditorEditModeType.EDIT.value, "", ""),
            (LEDEditorEditModeType.NEW.value, "", ""),
        ],
        default=LEDEditorEditModeType.IDLE.value,
    )
    edit_model: bpy.props.EnumProperty(  # type: ignore
        items=get_model_lists,
        default=-1,  # pyright: ignore
        update=update_edit_model,
        get=get_edit_model,
        set=set_edit_model,
    )
    edit_dancer: bpy.props.EnumProperty(  # type: ignore
        items=get_dancer_lists,
        default=-1,  # pyright: ignore
        update=update_edit_dancer,
        get=get_edit_dancer,
        set=set_edit_dancer,
    )
    edit_part: bpy.props.EnumProperty(  # type: ignore
        items=get_part_lists,
        default=-1,  # pyright: ignore
        update=update_edit_part,
        get=get_edit_part,
        set=set_edit_part,
    )
    edit_effect: bpy.props.EnumProperty(  # type: ignore
        items=get_effect_lists,
        default=-1,  # pyright: ignore
        update=update_edit_effect,
        get=get_edit_effect,
        set=set_edit_effect,
    )
    new_effect: bpy.props.StringProperty(default="New effect")  # type: ignore

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
        # update=update_multi_select_alpha,
    )


def register():
    bpy.utils.register_class(LEDEditorStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_led_editor",
        bpy.props.PointerProperty(type=LEDEditorStatus),
    )


def unregister():
    bpy.utils.unregister_class(LEDEditorStatus)
    delattr(bpy.types.WindowManager, "ld_ui_led_editor")
