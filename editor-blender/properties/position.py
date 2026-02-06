import bpy

from ..core.actions.property.position import update_current_position


def get_location(self: bpy.types.PropertyGroup) -> tuple[float, float, float]:
    """Get location, defaulting to the current object's location if not set"""
    stored = self.get("location")
    if stored is not None:
        return stored  # type: ignore

    obj = self.id_data
    if obj is not None:
        return tuple(obj.location)  # type: ignore

    return (0.0, 0.0, 0.0)


def set_location(
    self: bpy.types.PropertyGroup, value: tuple[float, float, float]
) -> None:
    """Set location"""
    self["location"] = value


def get_rotation(self: bpy.types.PropertyGroup) -> tuple[float, float, float]:
    """Get rotation, defaulting to the current object's rotation if not set"""
    stored = self.get("rotation")
    if stored is not None:
        return stored  # type: ignore

    obj = self.id_data
    if obj is not None:
        return tuple(obj.rotation_euler)  # type: ignore

    return (0.0, 0.0, 0.0)


def set_rotation(
    self: bpy.types.PropertyGroup, value: tuple[float, float, float]
) -> None:
    """Set rotation"""
    self["rotation"] = value


class PositionProperty(bpy.types.PropertyGroup):
    location: bpy.props.FloatVectorProperty(  # type: ignore
        name="Location",
        description="Location",
        subtype="XYZ",
        unit="LENGTH",
        precision=4,
        update=update_current_position,
        get=get_location,
        set=set_location,
    )
    rotation: bpy.props.FloatVectorProperty(  # type: ignore
        name="Rotation",
        description="Rotation",
        subtype="EULER",
        unit="ROTATION",
        precision=4,
        update=update_current_position,
        get=get_rotation,
        set=set_rotation,
    )
    is_none: bpy.props.BoolProperty(  # type: ignore
        name="None",
        default=False,
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
