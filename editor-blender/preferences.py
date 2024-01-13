from typing import Any

import bpy


class AddonPreferences(bpy.types.AddonPreferences):
    bl_idname = __package__

    token: bpy.props.StringProperty(  # type: ignore
        name="Token",
        description="Token for LightDance Editor",
        default="",
    )

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.prop(self, "token")


def set_preference(key: str, value: Any):
    prefs = bpy.context.preferences.addons[__package__].preferences  # type: ignore
    setattr(prefs, key, value)  # type: ignore


def get_preference(key: str) -> Any:
    prefs = bpy.context.preferences.addons[__package__].preferences  # type: ignore
    return getattr(prefs, key)  # type: ignore


def register():
    bpy.utils.register_class(AddonPreferences)
    bpy.context.preferences.use_preferences_save = True


def unregister():
    bpy.utils.unregister_class(AddonPreferences)
