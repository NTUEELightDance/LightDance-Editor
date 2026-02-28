from . import (
    color_palette,
    lights,
    objects,
    position,
    preferences,
    revision,
    timeline,
    ui,
)


def register():
    ui.register()
    objects.register()
    lights.register()
    position.register()
    color_palette.register()
    timeline.register()
    revision.register()
    preferences.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
    position.unregister()
    color_palette.unregister()
    timeline.unregister()
    revision.unregister()
    preferences.unregister()
