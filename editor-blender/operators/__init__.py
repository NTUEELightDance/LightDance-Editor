from . import async_core
from . import login


def register():
    async_core.register()
    login.register()

def unregister():
    async_core.unregister()
    login.unregister()
