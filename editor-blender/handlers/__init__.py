from . import animation, objects


def mount():
    print("Mounting handlers...")
    animation.mount()
    objects.mount()


def unmount():
    animation.unmount()
    objects.unmount()
