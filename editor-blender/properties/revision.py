import bpy


class KeyframeRevisionItem(bpy.types.PropertyGroup):
    frame_id: bpy.props.IntProperty()  # type: ignore
    frame_start: bpy.props.IntProperty()  # type: ignore
    meta: bpy.props.IntProperty(default=-1)  # type: ignore
    data: bpy.props.IntProperty(default=-1)  # type: ignore


class ModelHashItem(bpy.types.PropertyGroup):
    dancer_name: bpy.props.StringProperty()  # type: ignore
    model_hash: bpy.props.StringProperty()  # type: ignore


def register():
    bpy.utils.register_class(KeyframeRevisionItem)
    setattr(
        bpy.types.Scene,
        "ld_pos_rev",
        bpy.props.CollectionProperty(type=KeyframeRevisionItem),
    )
    setattr(
        bpy.types.Scene,
        "ld_ctrl_rev",
        bpy.props.CollectionProperty(type=KeyframeRevisionItem),
    )

    bpy.utils.register_class(ModelHashItem)
    setattr(
        bpy.types.Scene,
        "ld_dancer_model_hash",
        bpy.props.CollectionProperty(type=ModelHashItem),
    )


def unregister():
    bpy.utils.unregister_class(KeyframeRevisionItem)
    delattr(
        bpy.types.Scene,
        "ld_pos_rev",
    )
    delattr(
        bpy.types.Scene,
        "ld_ctrl_rev",
    )

    bpy.utils.unregister_class(ModelHashItem)
    delattr(bpy.types.Scene, "ld_dancer_model_hash")
