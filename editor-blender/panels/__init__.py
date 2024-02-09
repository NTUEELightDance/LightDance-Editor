from . import (
    auth,
    color_palette,
    control_editor,
    editor,
    led_editor,
    lightdance,
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

    timeline.register()


def unregister():
    lightdance.unregister()

    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    timeline.unregister()
    control_editor.unregister()

    led_editor.unregister()
