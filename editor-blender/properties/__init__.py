from . import lights, objects, ui


def register():
    ui.register()
    objects.register()
    lights.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
