import bpy


class LoginPropertyGroup(bpy.types.PropertyGroup):
    username: bpy.props.StringProperty()  # pyright: ignore
    password: bpy.props.StringProperty()  # pyright: ignore


class LoginPropertyGroupType:
    username: str
    password: str


def register():
    bpy.utils.register_class(LoginPropertyGroup)

    setattr(
        bpy.types.WindowManager,
        "ld_login",
        bpy.props.PointerProperty(type=LoginPropertyGroup),
    )

    # Properties for the states


def unregister():
    bpy.utils.unregister_class(LoginPropertyGroup)
    delattr(bpy.types.WindowManager, "ld_login")

    # Properties for the states
