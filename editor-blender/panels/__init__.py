from . import auth, color_palette, editor, pos_editor, startup, timeline


def register():
    startup.register()
    auth.register()
    editor.register()
    pos_editor.register()
    color_palette.register()
    timeline.register()


def unregister():
    startup.unregister()
    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    timeline.unregister()
