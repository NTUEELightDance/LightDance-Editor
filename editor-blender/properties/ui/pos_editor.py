import bpy

from ...core.actions.property.pos_editor import update_multi_select_delta_transform


class PosEditorStatus(bpy.types.PropertyGroup):
    """Status of the PosEditor"""

    multi_select: bpy.props.BoolProperty(  # type: ignore
        name="Multi Select",
        description="Multi select",
        default=False,
    )
    multi_select_delta_transform: bpy.props.FloatVectorProperty(  # type: ignore
        name="Multi Select Delta Transform",
        description="Multi select delta transform",
        default=(0.0, 0.0, 0.0),
        subtype="XYZ",
        unit="LENGTH",
        precision=4,
        update=update_multi_select_delta_transform,
    )
    multi_select_delta_transform_ref: bpy.props.FloatVectorProperty(  # type: ignore
        name="Multi Select Delta Transform Reference",
        description="Multi select delta transform reference",
        default=(0.0, 0.0, 0.0),
        subtype="XYZ",
        unit="LENGTH",
    )


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
