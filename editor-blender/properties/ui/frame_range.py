import bpy

from ...core.states import state


def update_frame_range_min(self, _):
    if self.ld_ui_frame_range_min >= self.ld_ui_frame_range_max:
        self.ld_ui_frame_range_min = self.ld_ui_frame_range_max - 1


def update_frame_range_max(self, _):
    if (
        state.partial_load_frames[1] != 0
        and self.ld_ui_frame_range_max > state.partial_load_frames[1]
    ):
        self.ld_ui_frame_range_max = state.partial_load_frames[1]
    elif self.ld_ui_frame_range_max <= self.ld_ui_frame_range_min:
        self.ld_ui_frame_range_max = self.ld_ui_frame_range_min + 1


def register():
    setattr(
        bpy.types.WindowManager,
        "ld_ui_frame_range_min",
        bpy.props.IntProperty(min=0, update=update_frame_range_min),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_ui_frame_range_max",
        bpy.props.IntProperty(min=1, update=update_frame_range_max),
    )


def unregister():
    delattr(bpy.types.WindowManager, "ld_ui_frame_range_min")
    delattr(bpy.types.WindowManager, "ld_ui_frame_range_max")
