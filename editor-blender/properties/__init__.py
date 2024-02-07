from . import color_palette, lights, objects, position, revision, scene, timeline, ui, waveform


def register():
    ui.register()
    objects.register()
    lights.register()
    position.register()
    color_palette.register()
    timeline.register()
    scene.register()
    revision.register()
    waveform.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
    position.unregister()
    color_palette.unregister()
    timeline.unregister()
    scene.unregister()
    waveform.unregister()
    revision.unregister()
