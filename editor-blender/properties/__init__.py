from . import lights, objects, position, ui


def register():
    ui.register()
    objects.register()
    lights.register()
    position.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
    position.unregister()
