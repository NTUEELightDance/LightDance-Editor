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

    from os import path

    from dotenv import load_dotenv

    # Load .env
    root_dir = path.dirname(path.realpath(__file__))
    dotenv_path = path.join(root_dir, ".env")
    load_dotenv(dotenv_path=dotenv_path)


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
