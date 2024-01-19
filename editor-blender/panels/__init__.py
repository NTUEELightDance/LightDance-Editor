from . import auth, editor, pos_editor, startup, color_palette


def register():
    startup.register()
    auth.register()
    editor.register()
    pos_editor.register()
    color_palette.register()


def unregister():
    startup.unregister()
    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
