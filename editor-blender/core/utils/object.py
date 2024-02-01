import bpy


def clear_selection():
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)  # type: ignore
