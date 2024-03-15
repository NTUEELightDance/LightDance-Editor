import bpy

from ...core.states import state


class LoadStatus(bpy.types.PropertyGroup):
    frame_start: bpy.props.IntProperty(
        default=state.music_frame_length, max=state.music_frame_length
    )  # pyright: ignore
    frame_end: bpy.props.IntProperty()  # pyright: ignore


def register():
    bpy.utils.register_class(LoadStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_load",
        bpy.props.PointerProperty(type=LoadStatus),
    )


def unregister():
    bpy.utils.unregister_class(LoadStatus)
    delattr(bpy.types.WindowManager, "ld_ui_load")
