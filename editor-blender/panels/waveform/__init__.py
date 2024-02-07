import bpy
from bpy.types import Panel

def side_menu(self, context):
    layout = self.layout
    scn = context.scene
    row = layout.row()
    row.operator('anim.enable_draw', text='On', icon = 'NORMALIZE_FCURVES')
    row.operator('anim.disable_draw', text='Off')
    # row = layout.row()
    # row.operator('fn.fetch_waveform', text='Fetch Waveform')

    row = layout.row()
    row.prop(scn.swd_settings, 'height_offset')
    # row = layout.row()
    # row.prop(scn.swd_settings, 'end_frame')
    row = layout.row()
    row.prop(scn.swd_settings, 'use_dope')
    row.prop(scn.swd_settings, 'use_graph')
    row = layout.row()
    row.prop(scn.swd_settings, 'use_time')

class SWD_PT_SWD_GRAPH_ui(Panel):
    bl_label = "Display waveform"
    bl_space_type = 'GRAPH_EDITOR'
    bl_region_type = 'UI'
    bl_category = "Display"

    def draw(self, context):
        side_menu(self, context)
        # layout = self.layout

class SWD_PT_SWD_DOPE_ui(Panel):
    bl_label = "Display waveform"
    bl_space_type = 'DOPESHEET_EDITOR'
    bl_region_type = 'UI'
    bl_category = "Display"
    
    def draw(self, context):
        side_menu(self, context)

## function to append in a menu
def palette_manager_menu(self, context):
    """Palette menu to append in existing menu"""
    # GPENCIL_MT_material_context_menu
    layout = self.layout
    # {'EDIT_GPENCIL', 'PAINT_GPENCIL','SCULPT_GPENCIL','WEIGHT_GPENCIL', 'VERTEX_GPENCIL'}
    layout.separator()
    # prefs = get_addon_prefs()

    layout.operator("", text='do stuff from material submenu', icon='MATERIAL')

#-# REGISTER

classes=(
SWD_PT_SWD_GRAPH_ui,
SWD_PT_SWD_DOPE_ui,
)

def register(): 
    for cls in classes:
        bpy.utils.register_class(cls)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
