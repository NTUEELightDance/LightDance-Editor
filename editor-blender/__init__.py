bl_info = {
    "name": "LightDance Editor",
    "author": "NTUEE LightDance",
    "version": (1, 2, 1),
    "blender": (4, 0, 0),
    "location": "View3D > Toolshelf",
    "description": "Addon for LightDance Editor",
    "warning": "",
    "wiki_url": "",
    "category": "LightDance",
}


def setup():
    from .requirements import install_requirements

    # Ensure requirements are installed (for release)
    install_requirements()

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
