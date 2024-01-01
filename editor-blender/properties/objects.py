import bpy


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


def unregister():
    delattr(bpy.types.Object, "ld_object_type")
    delattr(bpy.types.Object, "ld_dancer_name")
    delattr(bpy.types.Object, "ld_part_name")

    # Properties for the states
