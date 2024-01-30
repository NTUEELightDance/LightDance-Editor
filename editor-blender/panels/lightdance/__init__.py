import bpy

from ...core.states import state


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
        row.operator("lightdance.empty", text="Timeshift", icon="PLAY")
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

        if not state.is_running:
            row = layout.row()
            row.operator("lightdance.async_loop", text="Start", icon="PLAY")

        else:
            if not state.is_logged_in:
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

            else:
                row = layout.row()
                row.label(text="Loading...", icon="WORLD_DATA")


def register():
    bpy.utils.register_class(LightDanceToolsPanel)
    bpy.utils.register_class(LightDancePanel)


def unregister():
    bpy.utils.unregister_class(LightDanceToolsPanel)
    bpy.utils.unregister_class(LightDancePanel)
