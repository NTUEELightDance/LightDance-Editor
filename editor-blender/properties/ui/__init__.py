from . import color_palette, control_editor, login, pos_editor


def register():
    login.register()
    pos_editor.register()
    color_palette.register()
    control_editor.register()


def unregister():
    login.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    control_editor.unregister()
