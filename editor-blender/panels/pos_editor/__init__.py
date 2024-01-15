import bpy


class PosEditor(bpy.types.Panel):
    bl_label = "Position Editor"
    bl_idname = "VIEW_PT_LightDance_PosEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    # def draw(self, context):
