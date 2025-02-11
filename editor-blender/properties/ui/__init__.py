from . import (
    camera,
    color_palette,
    command_center,
    control_editor,
    led_editor,
    login,
    pos_editor,
    shift,
)


def register():
    camera.register()
    login.register()
    pos_editor.register()
    color_palette.register()
    command_center.register()
    control_editor.register()
    led_editor.register()
    shift.register()


def unregister():
    camera.unregister()
    login.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    command_center.unregister()
    control_editor.unregister()
    led_editor.unregister()
    shift.unregister()
