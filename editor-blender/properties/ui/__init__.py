from . import login, pos_editor


def register():
    login.register()
    pos_editor.register()


def unregister():
    login.unregister()
    pos_editor.unregister()
