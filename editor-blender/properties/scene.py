import bpy


def register():
    setattr(bpy.types.Scene, "ld_pos_frame", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_pos_meta", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_pos_data", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_control_frame", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_control_meta", bpy.props.IntProperty())
    setattr(bpy.types.Scene, "ld_control_data", bpy.props.IntProperty())


def unregister():
    delattr(bpy.types.Scene, "ld_pos_frame")
    delattr(bpy.types.Scene, "ld_pos_meta")
    delattr(bpy.types.Scene, "ld_pos_data")
    delattr(bpy.types.Scene, "ld_control_frame")
    delattr(bpy.types.Scene, "ld_control_meta")
    delattr(bpy.types.Scene, "ld_control_data")
