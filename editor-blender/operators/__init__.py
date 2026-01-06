from . import (
    animation,
    assets,
    async_core,
    auth,
    camera,
    clipboard,
    color_palette,
    command_center,
    control_editor,
    editor,
    led_editor,
    load,
    notification,
    ping,
    pos_editor,
    select,
    setup,
    shift,
    slider,
    timeline,
    utils,
    utils_test,
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
    camera.register()
    utils.register()
    notification.register()
    timeline.register()
    control_editor.register()
    command_center.register()
    led_editor.register()
    shift.register()
    clipboard.register()
    assets.register()
    ping.register()
    select.register()
    load.register()

    utils_test.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    auth.unregister()
    editor.unregister()
    slider.unregister()
    animation.unregister()
    pos_editor.unregister()
    color_palette.unregister()
    camera.unregister()
    utils.unregister()
    notification.unregister()
    timeline.unregister()
    control_editor.unregister()
    command_center.unregister()
    led_editor.unregister()
    shift.unregister()
    clipboard.unregister()
    assets.unregister()
    ping.unregister()
    select.unregister()
    load.unregister()

    utils_test.unregister()
