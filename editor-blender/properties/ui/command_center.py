import bpy


class CommandCenterStatus(bpy.types.PropertyGroup):
    """Status of command center"""

    connected: bpy.props.BoolProperty(default=False)  # type: ignore
    color: bpy.props.EnumProperty(
        items=[  # type: ignore
            ("red", "red", ""),
            ("green", "green", ""),
            ("blue", "blue", ""),
            ("yellow", "yellow", ""),
            ("magenta", "magenta", ""),
            ("cyan", "cyan", ""),
        ]
    )
    color_code: bpy.props.StringProperty(maxlen=7, default="#000000")  # type: ignore
    command: bpy.props.StringProperty()  # type: ignore
    delay: bpy.props.IntProperty(min=0, max=3000)  # type: ignore
    countdown: bpy.props.StringProperty(default="00:00")  # type: ignore


class CommandCenterRPiStatus(bpy.types.PropertyGroup):
    selected: bpy.props.BoolProperty()  # type: ignore
    name: bpy.props.StringProperty()  # type: ignore
    IP: bpy.props.StringProperty()  # type: ignore
    MAC: bpy.props.StringProperty()  # type: ignore
    connected: bpy.props.BoolProperty()  # type: ignore
    message: bpy.props.StringProperty()  # type: ignore
    statusCode: bpy.props.IntProperty()  # type: ignore
    interface_type: bpy.props.EnumProperty(  # type: ignore
        items=[("ethernet", "ethernet", ""), ("wifi", "wifi", "")]
    )


def register():
    bpy.utils.register_class(CommandCenterStatus)
    bpy.utils.register_class(CommandCenterRPiStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_command_center",
        bpy.props.PointerProperty(type=CommandCenterStatus),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_ui_rpi_status",
        bpy.props.CollectionProperty(type=CommandCenterRPiStatus),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_ui_command_center_dancer_index",
        bpy.props.IntProperty(),
    )


def unregister():
    bpy.utils.unregister_class(CommandCenterStatus)
    bpy.utils.unregister_class(CommandCenterRPiStatus)
    delattr(bpy.types.WindowManager, "ld_ui_command_center")
    delattr(bpy.types.WindowManager, "ld_ui_rpi_status")
    delattr(bpy.types.WindowManager, "ld_ui_command_center_dancer_index")
