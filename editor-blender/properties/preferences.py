from typing import cast

import bpy

from ..core.states import state


def get_auto_sync(self: bpy.types.PropertyGroup) -> bool:
    return cast(bool, self.get("auto_sync", False))


def get_follow_frame(self: bpy.types.PropertyGroup) -> bool:
    return cast(bool, self.get("follow_frame", False))


def set_auto_sync(self: bpy.types.PropertyGroup, value: bool):
    self["auto_sync"] = value
    state.preferences.auto_sync = value


def set_follow_frame(self: bpy.types.PropertyGroup, value: bool):
    if not bpy.context:
        return
    self["follow_frame"] = value
    state.preferences.follow_frame = value
    bpy.context.screen.use_follow = value


class Preferences(bpy.types.PropertyGroup):
    """Preferences"""

    auto_sync: bpy.props.BoolProperty(  # type: ignore
        name="Auto Sync",
        description="Auto sync updates",
        get=get_auto_sync,
        set=set_auto_sync,
    )
    follow_frame: bpy.props.BoolProperty(  # type: ignore
        name="Follow Frame",
        description="Follow frame",
        get=get_follow_frame,
        set=set_follow_frame,
    )


def register():
    bpy.utils.register_class(Preferences)


def unregister():
    bpy.utils.unregister_class(Preferences)
