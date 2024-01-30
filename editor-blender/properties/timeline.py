import bpy

from ..core.actions.property.timeline import (
    get_current_frame_index,
    set_current_frame_index,
)


def register():
    setattr(
        bpy.types.WindowManager,
        "ld_current_frame_index",
        bpy.props.StringProperty(
            default="0",
            get=get_current_frame_index,
            set=set_current_frame_index,
        ),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_fade",
        bpy.props.BoolProperty(
            default=False,
            description="Fade in/out",
        ),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_start",
        bpy.props.IntProperty(
            default=0,
            description="Frame start time",
        ),
    )


def unregister():
    delattr(bpy.types.WindowManager, "ld_current_frame_index")
    delattr(bpy.types.WindowManager, "ld_fade")
    delattr(bpy.types.WindowManager, "ld_start")
