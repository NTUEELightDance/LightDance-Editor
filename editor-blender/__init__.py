bl_info = {
    "name": "LightDance Editor",
    "author": "NTUEE LightDance",
    "version": (1, 0),
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

    # Initialize constants
    from .core.constants import constants

    constants.initialize()


def register():
    setup()

    from . import operators, panels, properties, storage

    storage.register()
    properties.register()
    operators.register()
    panels.register()


def unregister():
    from . import operators, panels, properties, storage

    storage.unregister()
    operators.unregister()
    panels.unregister()
    properties.unregister()
