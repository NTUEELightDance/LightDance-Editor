from . import auth, editor, pos_editor, startup


def register():
    startup.register()
    auth.register()
    editor.register()
    pos_editor.register()


def unregister():
    startup.unregister()
    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
