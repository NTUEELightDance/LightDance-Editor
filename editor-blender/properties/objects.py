import bpy

from .types import ObjectType


def register():
    setattr(
        bpy.types.Object,
        "ld_object_type",
        bpy.props.EnumProperty(
            name="ObjectType",
            description="Type of object",
            items=[  # pyright: ignore
                (ObjectType.DANCER.value, "Dancer", "", "", 0),
                (ObjectType.HUMAN.value, "Human", "", "", 1),
                (ObjectType.LIGHT.value, "Light", "", "", 2),
            ],
            default="human",
        ),
    )
    setattr(bpy.types.Object, "ld_model_name", bpy.props.StringProperty())
    setattr(bpy.types.Object, "ld_dancer_name", bpy.props.StringProperty())
    setattr(bpy.types.Object, "ld_part_name", bpy.props.StringProperty())
    setattr(bpy.types.Object, "selected_r_color", bpy.props.IntProperty())
    setattr(bpy.types.Object, "selected_g_color", bpy.props.IntProperty())
    setattr(bpy.types.Object, "selected_b_color", bpy.props.IntProperty())


def unregister():
    delattr(bpy.types.Object, "ld_object_type")
    delattr(bpy.types.Object, "ld_model_name")
    delattr(bpy.types.Object, "ld_dancer_name")
    delattr(bpy.types.Object, "ld_part_name")
    delattr(bpy.types.Object, "selected_r_color")
    delattr(bpy.types.Object, "selected_g_color")
    delattr(bpy.types.Object, "selected_b_color")
