from . import async_core, auth, editor, setup


def register():
    async_core.register()
    setup.register()
    auth.register()
    editor.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    auth.unregister()
    editor.unregister()
