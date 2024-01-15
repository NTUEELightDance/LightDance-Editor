import bpy


class PosEditorStatus(bpy.types.PropertyGroup):
    """Status of the PosEditor"""

    pass


def register():
    bpy.utils.register_class(PosEditorStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_pos_editor",
        bpy.props.PointerProperty(type=PosEditorStatus),
    )


def unregister():
    bpy.utils.unregister_class(PosEditorStatus)
    delattr(bpy.types.WindowManager, "ld_ui_pos_editor")
