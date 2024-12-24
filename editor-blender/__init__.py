def setup():
    # Initialize config
    from .core.config import config

    config.initialize()


def register():
    setup()

    from . import operators, panels, properties, storage

    properties.register()
    operators.register()
    panels.register()
    storage.register()


def unregister():
    from . import operators, panels, properties, storage

    storage.unregister()
    panels.unregister()
    operators.unregister()
    properties.unregister()
