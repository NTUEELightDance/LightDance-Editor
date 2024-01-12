import bpy


def obj_panel_autoselect_handler():
    """
    Auto-select a group of lights if one of each is selected.
    When a human object is selected, its dancer will also be auto-selected and vice versa.
    """
    objects = bpy.context.selected_objects
    for obj in objects:
        obj_type: str = getattr(obj, "ld_object_type")
        if obj_type == "light":
            parent_type: str = getattr(obj.parent, "ld_object_type")
            if parent_type == "light":
                for child in obj.parent.children:
                    child.select_set(True)
                obj.parent.select_set(True)
            else:
                for child in obj.children:
                    child.select_set(True)

        elif obj_type == "human":
            obj.parent.select_set(True)

        elif obj_type == "dancer":
            for child in obj.children:
                child_type: str = getattr(child, "ld_object_type")
                if child_type == "human":
                    child.select_set(True)


def register():
    bpy.msgbus.subscribe_rna(
        key=(bpy.types.LayerObjects, "active"),
        owner=bpy,
        args=(),
        notify=obj_panel_autoselect_handler,
    )
