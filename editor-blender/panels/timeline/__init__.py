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

    def draw(self, context: bpy.types.Context | None):
        if not context:
            return
        if not state.ready:
            return

        layout = self.layout
        layout.enabled = (
            not state.shifting and not state.requesting and not state.playing
        )

        box = layout.box()
        col = box.column(align=True)
        # col.use_property_split = True

        row = col.row()
        row.label(text="Time")
        row.prop(context.window_manager, "ld_time", text="")

        row = col.row()
        row.label(text="Play speed")
        row.prop(context.window_manager, "ld_play_speed", text="")

        row = layout.row(align=True)
        row.label(text="Frame")
        row.operator("lightdance.decrease_frame_index", text="", icon="TRIA_LEFT")
        row.prop(context.window_manager, "ld_current_frame_index", text="")
        row.operator("lightdance.increase_frame_index", text="", icon="TRIA_RIGHT")

        row = layout.row(align=True)
        row.label(text="Beat")
        row.operator("lightdance.decrease_beat_index", text="", icon="TRIA_LEFT")
        row.operator("lightdance.increase_beat_index", text="", icon="TRIA_RIGHT")

        row = layout.row(align=True)
        row.operator("lightdance.copy_frame", text="Copy", icon="PLAY")
        row.operator("lightdance.paste_frame", text="Paste", icon="PLAY")


def register():
    bpy.utils.register_class(TimelinePanel)


def unregister():
    bpy.utils.unregister_class(TimelinePanel)
