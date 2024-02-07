from . import animation, objects, waveform


def mount_handlers():
    animation.mount()
    objects.mount()
    waveform.mount()


def unmount_handlers():
    animation.unmount()
    objects.unmount()
    waveform.unmount()
