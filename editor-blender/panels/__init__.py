from . import (
    auth,
    color_palette,
    control_editor,
    editor,
    led_editor,
    pos_editor,
    startup,
    timeline,
)


def register():
    startup.register()
    auth.register()
    editor.register()
    pos_editor.register()
    color_palette.register()
    timeline.register()
    control_editor.register()
    led_editor.register()


def unregister():
    startup.unregister()
    auth.unregister()
    editor.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    timeline.unregister()
    control_editor.unregister()
    led_editor.unregister()
