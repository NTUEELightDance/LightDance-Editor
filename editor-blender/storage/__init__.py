from typing import Any

import bpy

from ..properties.preferences import Preferences


class LocalStorage(bpy.types.AddonPreferences):
    bl_idname = "editor-blender"

    token: bpy.props.StringProperty(  # type: ignore
        name="Token",
        description="Token for LightDance Editor",
        default="",
    )
    username: bpy.props.StringProperty(  # type: ignore
        name="Username",
        description="Username for LightDance Editor",
        default="",
    )
    preferences: bpy.props.PointerProperty(  # type: ignore
        name="Preferences",
        description="Preferences",
        type=Preferences,
    )

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.prop(self, "token")
        layout.prop(self, "username")


def set_storage(key: str, value: Any):
    prefs = bpy.context.preferences.addons["editor-blender"].preferences  # type: ignore
    setattr(prefs, key, value)  # type: ignore


def get_storage(key: str) -> Any:
    prefs = bpy.context.preferences.addons["editor-blender"].preferences  # type: ignore
    return getattr(prefs, key)  # type: ignore


def register():
    bpy.utils.register_class(LocalStorage)
    bpy.context.preferences.use_preferences_save = True


def unregister():
    bpy.utils.unregister_class(LocalStorage)
