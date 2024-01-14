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


def install_requirements():
    import subprocess
    import sys

    from .requirements import requirements

    command = [sys.executable, "-m", "pip", "install"] + requirements
    subprocess.check_call(command)


def register():
    install_requirements()

    from . import operators, panels, properties, storage

    storage.register()
    operators.register()
    panels.register()
    properties.register()


def unregister():
    from . import operators, panels, properties, storage

    storage.unregister()
    operators.unregister()
    panels.unregister()
    properties.unregister()
