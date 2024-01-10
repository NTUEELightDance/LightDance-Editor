from . import (
    frame,
    auto_select
)


def register():
    frame.register()
    auto_select.register()


def unregister():
    frame.unregister()
