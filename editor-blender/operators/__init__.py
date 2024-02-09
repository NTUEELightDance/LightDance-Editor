from . import (
    animation,
    async_core,
    auth,
    color_palette,
    control_editor,
    editor,
    led_editor,
    notification,
    pos_editor,
    setup,
    shift,
    slider,
    timeline,
    utils,
    waveform,
)


def register():
    async_core.register()
    setup.register()
    auth.register()
    editor.register()
    slider.register()
    animation.register()
    pos_editor.register()
    color_palette.register()
    utils.register()
    notification.register()
    timeline.register()
    control_editor.register()
    led_editor.register()
    shift.register()
    waveform.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    auth.unregister()
    editor.unregister()
    slider.unregister()
    animation.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    utils.unregister()
    notification.unregister()
    timeline.unregister()
    control_editor.unregister()
    led_editor.unregister()
    shift.unregister()
    waveform.unregister()
