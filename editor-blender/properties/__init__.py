from . import (
    login,
    objects, 
    lights
)


def register():
    login.register()
    objects.register()
    lights.register()


def unregister():
    login.unregister()
    objects.unregister()
    lights.unregister()
