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
    setattr(bpy.types.Object, "fade_for_selected_object", bpy.props.IntProperty())
    setattr(bpy.types.Object, "fade_for_new_status", bpy.props.IntProperty())
    setattr(bpy.types.Object, "fade_for_pinned_object", bpy.props.IntProperty())
    setattr(bpy.types.Object, "fade_blank", bpy.props.IntProperty())
    setattr(bpy.types.Object, "position_selected_dancer", bpy.props.BoolProperty())
    setattr(bpy.types.Object, "position_selected_overall", bpy.props.BoolProperty())
    setattr(bpy.types.Object, "position_pinned_dancer", bpy.props.BoolProperty())
    setattr(bpy.types.Object, "position_blank", bpy.props.BoolProperty())


def unregister():
    delattr(bpy.types.Object, "ld_object_type")
    delattr(bpy.types.Object, "ld_model_name")
    delattr(bpy.types.Object, "ld_dancer_name")
    delattr(bpy.types.Object, "ld_part_name")
    delattr(bpy.types.Object, "fade_for_selected_object")
    delattr(bpy.types.Object, "fade_for_new_status")
    delattr(bpy.types.Object, "fade_for_pinned_object")
    delattr(bpy.types.Object, "fade_blank")
    delattr(bpy.types.Object, "position_selected_dancer")
    delattr(bpy.types.Object, "position_selected_overall")
    delattr(bpy.types.Object, "position_pinned_dancer")
    delattr(bpy.types.Object, "position_blank")
