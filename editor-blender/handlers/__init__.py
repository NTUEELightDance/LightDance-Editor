from . import frame, objects


def register():
    frame.register()
    objects.register()


def unregister():
    frame.unregister()
