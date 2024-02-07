from . import (
    auth,
    color_palette,
    control_editor,
    editor,
    led_editor,
    lightdance,
    pos_editor,
    shift,
    startup,
    timeline,
    waveform,
)


def register():
    # NOTE: Order matters
    lightdance.register()
    # startup.register()

    auth.register()
    # shift.register()
    editor.register()
    pos_editor.register()
    control_editor.register()
    led_editor.register()
    waveform.register()
    color_palette.register()
    timeline.register()


def unregister():
    lightdance.unregister()
    # startup.unregister()
    auth.unregister()
    # shift.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    timeline.unregister()
    control_editor.unregister()
    led_editor.unregister()
    waveform.unregister()
