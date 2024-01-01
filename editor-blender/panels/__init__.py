from . import (
    login,
    property
)


def register():
    login.register()
    property.register()


def unregister():
    login.unregister()
    property.unregister()
