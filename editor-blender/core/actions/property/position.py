import bpy

from ....properties.types import PositionPropertyType


def update_current_position(self: bpy.types.PropertyGroup, context: bpy.types.Context):
    obj = context.object
    ld_position: PositionPropertyType = getattr(obj, "ld_position")

    obj.location = ld_position.transform
    obj.rotation_euler = ld_position.rotation
