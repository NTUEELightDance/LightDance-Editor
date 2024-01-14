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
        row = layout.row()

        if state.is_logged_in:
            row.operator("lightdance.logout", text="Logout", icon="PLAY")
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
    bpy.utils.register_class(AuthenticationPanel)


def unregister():
    bpy.utils.unregister_class(AuthenticationPanel)
