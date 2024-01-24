import bpy


class TimelinePanel(bpy.types.Panel):
    """Timeline Panel"""

    bl_label = "Timeline"
    bl_idname = "LIGHTDANCE_PT_timeline"
    bl_space_type = "DOPESHEET_EDITOR"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        row = layout.row(align=True)

        row.label(text="Frame")
        row.operator("lightdance.decrease_frame_index", text="", icon="TRIA_LEFT")
        row.prop(context.window_manager, "ld_current_frame_index", text="")
        row.operator("lightdance.increase_frame_index", text="", icon="TRIA_RIGHT")


def register():
    bpy.utils.register_class(TimelinePanel)


def unregister():
    bpy.utils.unregister_class(TimelinePanel)
