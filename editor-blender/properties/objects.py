import bpy

<<<<<<< HEAD
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
    setattr(bpy.types.Object, "ld_dancer_name", bpy.props.StringProperty())
    setattr(bpy.types.Object, "ld_part_name", bpy.props.StringProperty())
=======

def register():
    setattr(bpy.types.Object, "ld_object_type",
            bpy.props.EnumProperty(
                name="ObjectType",
                description="Type of object",
                items=[  # pyright: ignore
                    ("dancer", "Dancer", "", "", 0),
                    ("human", "Human", "", "", 1),
                    ("light", "Light", "", "", 2),
                ],
                default="human"
            ))
    setattr(bpy.types.Object, "ld_dancer_name",
            bpy.props.StringProperty())
    setattr(bpy.types.Object, "ld_part_name",
            bpy.props.StringProperty())

    # Properties for the states
>>>>>>> f9bf97e (add basic structure)


def unregister():
    delattr(bpy.types.Object, "ld_object_type")
    delattr(bpy.types.Object, "ld_dancer_name")
    delattr(bpy.types.Object, "ld_part_name")
<<<<<<< HEAD
=======

    # Properties for the states
>>>>>>> f9bf97e (add basic structure)
