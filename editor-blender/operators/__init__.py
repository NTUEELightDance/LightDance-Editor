from . import async_core, login, setup


def register():
    async_core.register()
    setup.register()
    login.register()


def unregister():
    async_core.unregister()
    setup.unregister()
    login.unregister()
