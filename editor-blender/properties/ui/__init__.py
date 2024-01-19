from . import color_palette, login, pos_editor


def register():
    login.register()
    pos_editor.register()
    color_palette.register()


def unregister():
    login.unregister()
    pos_editor.unregister()
    color_palette.unregister()
