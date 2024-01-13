from . import frame, objects


# TODO: Register in setup operator, not addon register
def mount():
    frame.mount()
    objects.mount()


def unmount():
    frame.unmount()
