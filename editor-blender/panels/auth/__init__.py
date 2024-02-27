import bpy

from ...core.states import state
from ...properties.ui.types import LoginPanelStatusType


class AuthenticationPanel(bpy.types.Panel):
    bl_label = "Authentication"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_Authentication"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.running and not state.logged_in

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.enabled = not state.requesting

        ld_ui_login: LoginPanelStatusType = getattr(
            context.window_manager, "ld_ui_login"
        )

        r1 = layout.row()
        r2 = layout.row()
        r3 = layout.row()

        r1.prop(ld_ui_login, "username", text="Username")
        r2.prop(ld_ui_login, "password", text="Password")
        r3.operator("lightdance.login", text="Login", icon="PLAY")


def register():
    bpy.utils.register_class(AuthenticationPanel)


def unregister():
    bpy.utils.unregister_class(AuthenticationPanel)
