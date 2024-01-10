import bpy

def obj_panel_autoselect_handler():
    """
    Auto-select a group of LEDs if one of each is selected. (LEDs must be grouped under a parent object)
    When a dancer's 'human' object is selected, all parts on the dancer will also be auto-selected.
    """
    objects = bpy.context.selected_objects
    all_objects = bpy.data.objects
    all_obj_keys = all_objects.keys()
    for obj in objects:
        led_id = obj.name.find("LED")
        if led_id >= 0 and obj.select_get():
            led = obj.name[:led_id+3]
            sub_id = obj.name.find("LED.")
            if obj.children: # all LED objects under a parent object
                for child in obj.children:
                    child.select_set(True)
            else:
                for child in obj.parent.children:
                    child.select_set(True)
            
        elif obj.name[:5] == "Human":
            all_child_object = obj.parent.children_recursive
            for child in all_child_object:
                child.select_set(True)
            obj.parent.select_set(True)
        
        elif not obj.parent and obj.select_get():
            all_child_object = obj.children_recursive
            for child in all_child_object:
                child.select_set(True)
                
def register():
    bpy.msgbus.subscribe_rna(
    key=(bpy.types.LayerObjects, 'active'),
    owner=bpy,
    args=(),
    notify=obj_panel_autoselect_handler)