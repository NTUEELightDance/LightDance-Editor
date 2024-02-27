import bpy

from ...core.models import FrameType


def get_start(self: bpy.types.PropertyGroup) -> int:
    return self["start"]


def set_start(self: bpy.types.PropertyGroup, value: int):
    end: int = self["end"]
    self["start"] = value

    if end < value:
        self["end"] = value


def get_end(self: bpy.types.PropertyGroup) -> int:
    return self["end"]


def set_end(self: bpy.types.PropertyGroup, value: int):
    start: int = self["start"]
    self["end"] = value

    if value < start:
        self["start"] = value


class ShiftStatus(bpy.types.PropertyGroup):
    """Status of the TimeShift"""

    frame_type: bpy.props.EnumProperty(  # type: ignore
        name="Frame Type",
        description="Frame type",
        items=[
            (FrameType.CONTROL.value, "Control", ""),
            (FrameType.POS.value, "Position", ""),
            (FrameType.BOTH.value, "Both", ""),
        ],
        default=FrameType.CONTROL.value,
    )
    start: bpy.props.IntProperty(  # type: ignore
        name="Start",
        description="Start",
        min=0,
        default=0,
        get=get_start,
        set=set_start,
    )
    end: bpy.props.IntProperty(  # type: ignore
        name="End",
        description="End",
        min=0,
        default=0,
        get=get_end,
        set=set_end,
    )
    displacement: bpy.props.IntProperty(  # type: ignore
        name="Displacement",
        description="Displacement",
        default=0,
    )


def register():
    bpy.utils.register_class(ShiftStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_time_shift",
        bpy.props.PointerProperty(type=ShiftStatus),
    )


def unregister():
    bpy.utils.unregister_class(ShiftStatus)
    delattr(bpy.types.WindowManager, "ld_ui_time_shift")
