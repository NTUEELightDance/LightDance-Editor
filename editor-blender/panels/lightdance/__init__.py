import bpy

from ...core.states import state
from ...properties.ui.types import TimeShiftStatusType


def draw_time_shift(layout: bpy.types.UILayout):
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    row = layout.row()
    row.label(text="Frame Type")
    row.prop(ld_ui_time_shift, "frame_type", text="")

    col = layout.column(align=True)
    col.prop(ld_ui_time_shift, "start", text="Start")
    col.prop(ld_ui_time_shift, "end", text="End")
    col.prop(ld_ui_time_shift, "displacement", text="Displacement")

    row = layout.row()
    row.operator("lightdance.confirm_shifting", text="Confirm", icon="CHECKMARK")
    row.operator("lightdance.cancel_shifting", text="Cancel", icon="X")


class LightDanceToolsPanel(bpy.types.Panel):
    bl_label = "Tools"
    bl_idname = "VIEW_PT_LightDance_Tools"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"INSTANCED"}

    def draw(self, context: bpy.types.Context):
        layout = self.layout

        row = layout.row()
        row.operator("lightdance.toggle_shifting", text="Timeshift", icon="PLAY")
        row = layout.row()
        row.operator("lightdance.clear_assets", text="Clear Assets", icon="PLAY")
        row = layout.row()
        row.operator("lightdance.logout", text="Logout", icon="PLAY")


class LightDancePanel(bpy.types.Panel):
    bl_label = "LightDance"
    bl_idname = "VIEW_PT_LightDance_LightDance"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context):
        # Draw header
        layout = self.layout
        layout.enabled = not state.requesting

        if not state.running:
            row = layout.row()
            row.operator("lightdance.async_loop", text="Start", icon="PLAY")

        else:
            if not state.logged_in:
                return

            if state.ready:
                # TODO: Show function menu
                row = layout.row()
                if state.username == "":
                    row.label(text="TestUser", icon="WORLD_DATA")
                else:
                    row.label(text=state.username, icon="WORLD_DATA")

                row.popover(
                    "VIEW_PT_LightDance_Tools", text="Tools", icon="TOOL_SETTINGS"
                )

                if state.shifting:
                    row = layout.row()
                    row.label(text="Time Shift")

                    box = layout.box()
                    draw_time_shift(box)

            else:
                row = layout.row()
                row.label(text="Loading...", icon="WORLD_DATA")


def register():
    bpy.utils.register_class(LightDanceToolsPanel)
    bpy.utils.register_class(LightDancePanel)


def unregister():
    bpy.utils.unregister_class(LightDanceToolsPanel)
    bpy.utils.unregister_class(LightDancePanel)
