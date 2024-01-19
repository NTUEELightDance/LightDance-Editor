from . import lights, objects, position, ui, color_palette


def register():
    ui.register()
    objects.register()
    lights.register()
    position.register()
    color_palette.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
    position.unregister()
    color_palette.unregister()
