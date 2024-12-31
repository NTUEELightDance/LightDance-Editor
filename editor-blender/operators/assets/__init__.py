import os

import bpy

from ...core.config import config
from ...core.utils.notification import notify


def remove_dir_files(dir_path: str):
    for content in os.listdir(dir_path):
        content_path = os.path.join(dir_path, content)
        if os.path.isdir(content_path):
            remove_dir_files(content_path)
        else:
            os.remove(content_path)


class ClearAssets(bpy.types.Operator):
    bl_idname = "lightdance.clear_assets"
    bl_label = "Clear Assets"
    bl_options = {"REGISTER", "UNDO"}

    confirm: bpy.props.BoolProperty(  # type: ignore
        name="I know what I am doing",
        default=False,
    )

    def execute(self, context: bpy.types.Context | None):
        confirm: bool = getattr(self, "confirm")

        if not confirm:
            notify("ERROR", "Cancelled")
            return {"CANCELLED"}

        remove_dir_files(config.ASSET_PATH)
        notify("INFO", "Assets cleared")

        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context | None, event: bpy.types.Event):
        if not context:
            return {"CANCELLED"}
        return context.window_manager.invoke_props_dialog(self)


def register():
    bpy.utils.register_class(ClearAssets)


def unregister():
    bpy.utils.unregister_class(ClearAssets)
