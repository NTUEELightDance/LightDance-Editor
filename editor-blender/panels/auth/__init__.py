import bpy

from ...core.states import state
from ...properties.login import LoginPropertyGroupType


class AuthenticationPanel(bpy.types.Panel):
    bl_label = "Authentication"
    bl_idname = "VIEW_PT_LightDance_Authentication"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.is_running

    def draw(self, context: bpy.types.Context):
        global _loop_operator_running

        layout = self.layout

        if state.is_logged_in:
            r1 = layout.row()
            r1.operator("lightdance.logout", text="Logout", icon="PLAY")

            if not state.ready:
                r2 = layout.row()
                r2.label(text="Loading...", icon="WORLD_DATA")
        else:
            ld_login: LoginPropertyGroupType = getattr(
                context.window_manager, "ld_login"
            )

            r1 = layout.row()
            r2 = layout.row()
            r3 = layout.row()

            r1.prop(ld_login, "username", text="Username")
            r2.prop(ld_login, "password", text="Password")
            r3.operator("lightdance.login", text="Login", icon="PLAY")


def register():
    bpy.utils.register_class(AuthenticationPanel)


def unregister():
    bpy.utils.unregister_class(AuthenticationPanel)
