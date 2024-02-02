import bpy

from ...core.states import state


class SetupPanel(bpy.types.Panel):
    bl_label = "LightDance Editor Startup"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_Startup"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return not state.running

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        row = layout.row()
        row.operator("lightdance.async_loop", text="Start", icon="PLAY")


def register():
    bpy.utils.register_class(SetupPanel)


def unregister():
    bpy.utils.unregister_class(SetupPanel)
