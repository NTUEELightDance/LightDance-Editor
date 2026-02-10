from typing import cast

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
    self: bpy.types.Object, context: bpy.types.Context | None
) -> list[tuple[str, str, str, int, int]]:
    collection = icon_collections["main"]
    if not bpy.context:
        return []

    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == ObjectType.LIGHT.value:
        ld_color_palette: list[ColorPaletteItemType] = getattr(
            bpy.context.window_manager, "ld_color_palette"
        )
        color_list = [
            (
                color.color_name,
                color.color_name,
                "",
                cast(dict[str, bpy.types.ImagePreview], collection)[
                    color.color_name
                ].icon_id,
                color.color_id,
            )
            for color in ld_color_palette
        ]
        color_list.sort(key=lambda x: x[1])

        if getattr(self, "ld_light_type") == LightType.LED_BULB.value:
            color_list.insert(0, ("[gradient]", "[gradient]", "", "MOD_ARRAY", -1))  # type: ignore

        return color_list  # pyright: ignore

    return []


def get_effect_lists(
    self: bpy.types.Object, context: bpy.types.Context | None
) -> list[tuple[str, str, str, str, int] | tuple[str, str, str]]:
    ld_object_type: str = getattr(self, "ld_object_type")
    if ld_object_type == ObjectType.LIGHT.value:
        ld_model_name: str = getattr(self, "ld_model_name")
        ld_part_name: str = getattr(self, "ld_part_name")

        effect_lists = [
            (effect.name, effect.name, "", "", effect.id)
            for effect in state.led_map[ld_model_name][ld_part_name].values()
        ]
        effect_lists.sort(key=lambda x: x[1])

        effect_lists.insert(0, ("[Bulb Color]", "[Bulb Color]", "", "", 0))
        effect_lists.insert(0, ("no-change", "no-change", "", "", -1))
        return effect_lists  # pyright: ignore

    return []


def get_color(self: bpy.types.Object) -> int:
    if not state.ready:
        return 0

    if state.edit_state == EditMode.EDITING:
        return cast(int, self.get("ld_color", 0))

    ld_dancer_name: str = self["ld_dancer_name"]
    ld_part_name: str = self["ld_part_name"]

    dancer_status = state.current_status.get(ld_dancer_name)
    if dancer_status is None:
        return 0

    status = dancer_status.get(ld_part_name)
    if status is None:
        return 0

    color_id = cast(FiberData, status).color_id
    self["ld_color"] = color_id

    return color_id
    # return self["ld_color"]


def set_color(self: bpy.types.Object, value: int) -> None:
    self["ld_color"] = value


def get_effect(self: bpy.types.Object) -> int:
    if not state.ready:
        return 0

    if state.edit_state == EditMode.EDITING:
        return cast(int, self.get("ld_effect", 0))

    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    ld_part_name: str = getattr(self, "ld_part_name")

    status = state.current_status[ld_dancer_name][ld_part_name]
    return cast(LEDData, status).effect_id


def set_effect(self: bpy.types.Object, value: int) -> None:
    self["ld_effect"] = value


def update_is_none(self: bpy.types.Object, context: bpy.types.Context) -> None:
    """
    On update ld_is_none, update every part of same dancer to same is_none
    """
    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    this_part_name: str = getattr(self, "ld_part_name")

    this_is_none: bool = getattr(self, "ld_is_none")
    part_map = state.dancer_part_objects_map[ld_dancer_name][1]
    for part_name, part_obj in part_map.items():
        if part_name == this_part_name:
            continue

        other_is_none = getattr(part_obj, "ld_is_none")
        if other_is_none != this_is_none:
            setattr(part_obj, "ld_is_none", this_is_none)


def update_fade(self: bpy.types.Object, context: bpy.types.Context) -> None:
    """
    On update ld_fade, update every part of same dancer to same fade
    """
    ld_dancer_name: str = getattr(self, "ld_dancer_name")
    this_part_name: str = getattr(self, "ld_part_name")

    this_fade: bool = getattr(self, "ld_fade")
    part_map = state.dancer_part_objects_map[ld_dancer_name][1]
    for part_name, part_obj in part_map.items():
        if part_name == this_part_name:
            continue

        other_fade = getattr(part_obj, "ld_fade")
        if other_fade != this_fade:
            setattr(part_obj, "ld_fade", this_fade)


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
            items=get_color_lists,  # type: ignore
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

    setattr(
        bpy.types.Object,
        "ld_is_none",
        bpy.props.BoolProperty(
            name="Set None",
            description="Determine if the dancer in this frame has effect",
            default=False,
            update=update_is_none,
        ),
    )

    setattr(
        bpy.types.Object,
        "ld_fade",
        bpy.props.BoolProperty(
            name="Fade",
            description="Fade for the dancer of this frame",
            default=False,
            update=update_fade,
        ),
    )

    # Properties for the states


def unregister():
    delattr(bpy.types.Object, "ld_light_type")
    delattr(bpy.types.Object, "ld_effect")
    delattr(bpy.types.Object, "ld_color")

    # Properties for the states
