from . import (
    auth,
    camera,
    color_palette,
    command_center,
    control_editor,
    editor,
    led_editor,
    lightdance,
    pin,
    pos_editor,
    timeline,
)


def register():
    # NOTE: Order matters
    lightdance.register()

    auth.register()
    editor.register()
    pos_editor.register()
    control_editor.register()
    led_editor.register()
    color_palette.register()
    camera.register()

    timeline.register()
    pin.register()
    command_center.register()


def unregister():
    lightdance.unregister()

    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    camera.unregister()
    timeline.unregister()
    pin.unregister()
    command_center.unregister()
    control_editor.unregister()

    led_editor.unregister()
