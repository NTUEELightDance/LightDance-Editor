from . import animation, name_tag, objects, waveform


def mount_handlers():
    animation.mount()
    objects.mount()
    waveform.mount()
    name_tag.mount()


def unmount_handlers():
    animation.unmount()
    objects.unmount()
    waveform.unmount()
    name_tag.unmount()
