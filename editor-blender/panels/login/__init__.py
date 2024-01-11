import bpy

from ...core.states import state
from ...properties.login import LoginPropertyGroupType


class StartupPanel(bpy.types.Panel):
    bl_label = "Start LightDance Editor"
    bl_idname = "VIEW_PT_Startup"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context):
        global _loop_operator_running

        layout = self.layout
        row = layout.row()

        if not state.is_running:
            row.operator("lightdance.async_loop", text="Start", icon="PLAY")
        else:
            ld_login: LoginPropertyGroupType = getattr(
                context.window_manager, "ld_login"
            )

            r1 = layout.row()
            r2 = layout.row()
            r3 = layout.row()

            r3.operator("lightdance.login", text="Login", icon="PLAY")

            r1.prop(ld_login, "username", text="Username")
            r2.prop(ld_login, "password", text="Password")


def register():
    bpy.utils.register_class(StartupPanel)


def unregister():
    bpy.utils.unregister_class(StartupPanel)
