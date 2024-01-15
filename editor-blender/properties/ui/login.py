import bpy


class LoginPanelStatus(bpy.types.PropertyGroup):
    username: bpy.props.StringProperty()  # pyright: ignore
    password: bpy.props.StringProperty()  # pyright: ignore


class LoginPanelStatusType:
    username: str
    password: str


def register():
    bpy.utils.register_class(LoginPanelStatus)

    setattr(
        bpy.types.WindowManager,
        "ld_ui_login",
        bpy.props.PointerProperty(type=LoginPanelStatus),
    )

    # Properties for the states


def unregister():
    bpy.utils.unregister_class(LoginPanelStatus)
    delattr(bpy.types.WindowManager, "ld_ui_login")

    # Properties for the states
