import bpy

from ..core.actions.property.timeline import (
    get_current_frame_index,
    get_play_speed,
    get_time,
    set_current_frame_index,
    set_play_speed,
    set_time,
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
        "ld_start",
        bpy.props.IntProperty(
            default=0,
            description="Frame start time",
        ),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_play_speed",
        bpy.props.FloatProperty(
            min=0.05,
            max=2.0,
            get=get_play_speed,
            set=set_play_speed,
            description="Play speed",
        ),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_time",
        bpy.props.StringProperty(
            get=get_time,
            set=set_time,
            description="Time",
        ),
    )


def unregister():
    delattr(bpy.types.WindowManager, "ld_current_frame_index")
    delattr(bpy.types.WindowManager, "ld_start")
    delattr(bpy.types.WindowManager, "ld_play_speed")
    delattr(bpy.types.WindowManager, "ld_time")
