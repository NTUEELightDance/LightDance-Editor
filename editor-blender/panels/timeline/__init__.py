import bpy

from ...core.states import state


class TimelinePanel(bpy.types.Panel):
    """Timeline Panel"""

    bl_label = "Timeline"
    bl_idname = "LIGHTDANCE_PT_timeline"
    bl_space_type = "DOPESHEET_EDITOR"
    bl_region_type = "UI"
    bl_category = "LightDance"

    # @classmethod
    # def poll(cls, context: bpy.types.Context):
    #     return state.ready

    def draw(self, context: bpy.types.Context):
        if not state.ready:
            return

        layout = self.layout
        layout.enabled = (
            not state.shifting and not state.requesting and not state.playing
        )

        row = layout.row(align=True)
        row.label(text="Frame")
        row.operator("lightdance.decrease_frame_index", text="", icon="TRIA_LEFT")
        row.prop(context.window_manager, "ld_current_frame_index", text="")
        row.operator("lightdance.increase_frame_index", text="", icon="TRIA_RIGHT")

        box = layout.box()
        box.use_property_split = True

        row = box.row(align=True)
        row.prop(context.window_manager, "ld_time", text="Time")

        row = box.row(align=True)
        row.prop(context.window_manager, "ld_play_speed", text="Play speed")


def register():
    bpy.utils.register_class(TimelinePanel)


def unregister():
    bpy.utils.unregister_class(TimelinePanel)
