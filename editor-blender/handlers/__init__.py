from . import frame, objects


def mount():
    print("Mounting handlers...")
    frame.mount()
    objects.mount()


def unmount():
    frame.unmount()
    objects.unmount()
