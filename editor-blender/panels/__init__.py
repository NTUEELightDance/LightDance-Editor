from . import auth, editor, property, startup


def register():
    startup.register()
    auth.register()
    editor.register()
    property.register()


def unregister():
    startup.unregister()
    auth.unregister()
    editor.unregister()
    property.unregister()
