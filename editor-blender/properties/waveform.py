import bpy
from bpy.props import (FloatProperty,
                        BoolProperty,
                        EnumProperty,
                        StringProperty,
                        IntProperty,
                        FloatVectorProperty,
                        PointerProperty)
from ..operators import utils

## update on prop change
def change_edit_lines_opacity(self, context):
    for gp in bpy.data.grease_pencils:
        if not gp.is_annotation:
            gp.edit_line_color[3]=self.edit_lines_opacity

def update_end_frame(self, context):
    utils.execute_operator('anim.disable_draw')
    utils.execute_operator('anim.enable_draw')

class SWD_UL_sound_list(bpy.types.UIList):
    #   index is index of the current item in the collection.
    #   flt_flag is the result of the filtering process for this item.
    #   Note: as index and flt_flag are optional arguments, you do not have to use/declare them here if you don't
    #         need them.
    def draw_item(self, context, layout, data, item, icon, active_data, active_propname):
        strip = item
        ## showing the prop make strip name editable by double click!
        # layout.prop(strip, "name", text="", emboss=False) # , icon_value=icon
        ## non editable name
        layout.label(text=strip.name)

    def draw_filter(self, context, layout):
        row = layout.row()
        subrow = row.row(align=True)
        subrow.prop(self, "filter_name", text="") # Only show items matching this name (use ‘*’ as wildcard)

    def filter_items(self, context, data, propname):
        collec = getattr(data, propname)
        helper_funcs = bpy.types.UI_UL_list
        # note : self.bitflag_filter_item == 1073741824 (reserved to filter)

        flt_type = 'SOUND'
        flt_flags = []
        flt_neworder = []
        if self.filter_name:
            flt_flags = helper_funcs.filter_items_by_name(self.filter_name, self.bitflag_filter_item, collec, "name",
                                                          reverse=self.use_filter_sort_reverse)#self.use_filter_name_reverse)
            # combine search result and type filter result
            flt_flags = [flt_flags[i] & self.bitflag_filter_item if strip.type == flt_type else 0 for i, strip in enumerate(collec)]
        else:
            flt_flags = [self.bitflag_filter_item if strip.type == flt_type else 0 for strip in collec]
        return flt_flags, flt_neworder

class SWD_PGT_settings(bpy.types.PropertyGroup):
    use_graph : BoolProperty(
        name="Graph",
        description="Enable display in graph editor",
        default=True, options={'HIDDEN'})

    use_dope : BoolProperty(
        name="Dopesheet",
        description="Enable display in dopesheet editor",
        default=True, options={'HIDDEN'})

    use_time : BoolProperty(
        name="Timeline",
        description="Enable display in timeline editor",
        default=True, options={'HIDDEN'})

    height_offset : IntProperty(
        name="Height Offset", description="Adjust the height of the waveform", 
        default=0, min=-10000, max=10000, soft_min=-5000, soft_max=5000, step=1, options={'HIDDEN'})#, subtype='PIXEL'
    
    end_frame : IntProperty(
        name="End Frame", description="The ending frame of the music (rerender when changed)",
        default=420000, min=10, max=500000, soft_min=10, soft_max=500000, step=1, options={'HIDDEN'},
        update=update_end_frame)

classes = (
    SWD_PGT_settings,
    SWD_UL_sound_list,
)

def register(): 
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.swd_settings = bpy.props.PointerProperty(type = SWD_PGT_settings)


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.swd_settings
