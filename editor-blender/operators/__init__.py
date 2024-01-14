from . import async_core, auth, setup


def register():
    async_core.register()
    setup.register()
    auth.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    auth.unregister()
