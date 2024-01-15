import bpy

from ..core.actions.property.position import (
    continuous_update_current_position,
    update_current_position,
)
from ..core.actions.property.utils import dragging_wrapper


class PositionProperty(bpy.types.PropertyGroup):
    transform: bpy.props.FloatVectorProperty(  # type: ignore
        name="Transform",
        description="Transform",
        default=(0.0, 0.0, 0.0),
        subtype="XYZ",
        unit="LENGTH",
        update=dragging_wrapper(
            continuous_update_current_position, update_current_position
        ),
    )
    rotation: bpy.props.FloatVectorProperty(  # type: ignore
        name="Rotation",
        description="Rotation",
        default=(0.0, 0.0, 0.0),
        subtype="EULER",
        unit="ROTATION",
        update=dragging_wrapper(
            continuous_update_current_position, update_current_position
        ),
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
