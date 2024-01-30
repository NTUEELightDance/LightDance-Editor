import bpy


from ...properties.login import LoginPropertyGroup


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

        is_running = getattr(context.window_manager, "ld_is_running", False)

        if not is_running:
            row.operator("lightdance.async_loop", text="Start", icon="PLAY")
        else:
            login: LoginPropertyGroup = getattr(
                context.window_manager, "ld_login")

            r1 = layout.row()
            r2 = layout.row()
            r3 = layout.row()

            r3.operator("lightdance.login", text="Login", icon="PLAY")

            r1.prop(login, 'username', text="Username")
            r2.prop(login, 'password', text="Password")


def register():
    bpy.utils.register_class(StartupPanel)


def unregister():
    bpy.utils.unregister_class(StartupPanel)
