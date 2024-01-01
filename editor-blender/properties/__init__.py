<<<<<<< HEAD
from . import color_palette, lights, objects, position, scene, timeline, ui


def register():
    ui.register()
    objects.register()
    lights.register()
    position.register()
    color_palette.register()
    timeline.register()
    scene.register()


def unregister():
    ui.unregister()
    objects.unregister()
    lights.unregister()
    position.unregister()
    color_palette.unregister()
    timeline.unregister()
    scene.unregister()
=======
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
>>>>>>> f9bf97e (add basic structure)
