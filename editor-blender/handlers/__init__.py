<<<<<<< HEAD
from . import animation, objects


def mount():
    print("Mounting handlers...")
    animation.mount()
    objects.mount()


def unmount():
    animation.unmount()
    objects.unmount()
=======
from . import (
    frame
)


def register():
    frame.register()


def unregister():
    frame.unregister()
>>>>>>> f9bf97e (add basic structure)
