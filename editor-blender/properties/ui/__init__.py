from . import color_palette, control_editor, led_editor, login, pos_editor, shift


def register():
    login.register()
    pos_editor.register()
    color_palette.register()
    control_editor.register()
    led_editor.register()
    shift.register()


def unregister():
    login.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    control_editor.unregister()
    led_editor.unregister()
    shift.unregister()
