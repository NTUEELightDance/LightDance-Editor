import bpy

from . import handlers, local_storage, operators, panels, properties

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


def register():
    local_storage.register()
    operators.register()
    panels.register()
    properties.register()


def unregister():
    local_storage.unregister()
    operators.unregister()
    panels.unregister()
    properties.unregister()

    handlers.unmount()
