from . import auth, property, startup


def register():
    startup.register()
    auth.register()
    property.register()


def unregister():
    startup.unregister()
    auth.unregister()
    property.unregister()
