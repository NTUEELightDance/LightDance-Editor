from . import animation, async_core, auth, editor, pos_editor, setup, color_palette, slider


def register():
    print("ops registered -------------------------")
    async_core.register()
    setup.register()
    auth.register()
    editor.register()
    slider.register()
    animation.register()
    pos_editor.register()
    color_palette.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    auth.unregister()
    editor.unregister()
    slider.unregister()
    animation.unregister()
    pos_editor.unregister()
    color_palette.unregister()
