import bpy

from ..core.utils.for_dev_only.test_keyframe import ctrl_test_frame, pos_test_frame


def register():
    setattr(bpy.types.Scene, "ld_pos_frame", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_control_frame", bpy.props.IntProperty())
    # FIXME clear this after test
    setattr(bpy.types.Scene, ctrl_test_frame, bpy.props.IntProperty())
    setattr(bpy.types.Scene, pos_test_frame, bpy.props.IntProperty())


def unregister():
    delattr(bpy.types.Scene, "ld_pos_frame")
    delattr(bpy.types.Scene, "ld_control_frame")
    delattr(bpy.types.Scene, ctrl_test_frame)
    delattr(bpy.types.Scene, pos_test_frame)
