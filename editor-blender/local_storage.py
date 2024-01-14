from typing import Any

import bpy


class LocalStorage(bpy.types.AddonPreferences):
    bl_idname = "editor-blender"

    token: bpy.props.StringProperty(  # type: ignore
        name="Token",
        description="Token for LightDance Editor",
        default="",
    )

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.prop(self, "token")


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
