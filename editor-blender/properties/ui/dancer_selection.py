import bpy


class DancerSelectionStatus(bpy.types.PropertyGroup):
    """Store if a dancer is shown at partial load or not"""

    name: bpy.props.StringProperty()  # type: ignore
    shown: bpy.props.BoolProperty()  # type: ignore


def register():
    bpy.utils.register_class(DancerSelectionStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_dancers_selection",
        bpy.props.CollectionProperty(type=DancerSelectionStatus),
    )
    setattr(
        bpy.types.WindowManager, "ld_ui_dancer_selection_index", bpy.props.IntProperty()
    )


def unregister():
    bpy.utils.unregister_class(DancerSelectionStatus)
    delattr(bpy.types.WindowManager, "ld_ui_dancers_selection")
    delattr(bpy.types.WindowManager, "ld_ui_dancer_selection_index")
