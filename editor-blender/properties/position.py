import bpy

from ..core.actions.property.position import update_current_position


class PositionProperty(bpy.types.PropertyGroup):
    location: bpy.props.FloatVectorProperty(  # type: ignore
        name="Location",
        description="Location",
        default=(0.0, 0.0, 0.0),
        subtype="XYZ",
        unit="LENGTH",
        precision=4,
        update=update_current_position,
    )
    rotation: bpy.props.FloatVectorProperty(  # type: ignore
        name="Rotation",
        description="Rotation",
        default=(0.0, 0.0, 0.0),
        subtype="EULER",
        unit="ROTATION",
        precision=4,
        update=update_current_position,
    )


def register():
    bpy.utils.register_class(PositionProperty)
    setattr(
        bpy.types.Object,
        "ld_position",
        bpy.props.PointerProperty(type=PositionProperty),
    )


def unregister():
    bpy.utils.unregister_class(PositionProperty)
    delattr(bpy.types.Object, "ld_position")
