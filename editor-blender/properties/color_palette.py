import bpy

class ld_ColorItem(bpy.types.PropertyGroup):
    colorId: bpy.props.StringProperty() # type: ignore
    colorName: bpy.props.StringProperty(default='') # type: ignore
    colorFloat: bpy.props.FloatVectorProperty(default=(0,0,0), min=0, max=1, subtype = "COLOR") # type: ignore
    colorCode: bpy.props.IntVectorProperty(default=(0,0,0) ,min=0, max=255) # type: ignore
    colorAlpha: bpy.props.FloatProperty(default=1, min=0, max=1) # type: ignore
    colorEditing:bpy.props.BoolProperty(default=False) # type: ignore
    
    
def register():
    print("color palette props init------------------------------")
    bpy.utils.register_class(ld_ColorItem)
    setattr(bpy.types.WindowManager,"ld_ColorPalette", bpy.props.CollectionProperty(type=ld_ColorItem))
    setattr(bpy.types.WindowManager,"ld_ColorPalette_temp", bpy.props.CollectionProperty(type=ld_ColorItem))
    # bpy.msgbus.clear_by_owner(bpy)

def unregister():
    bpy.utils.unregister_class(ld_ColorItem)
    getattr(bpy.context.window_manager,"ld_ColorPalette").clear()
    delattr(bpy.types.WindowManager, "ld_ColorPalette")