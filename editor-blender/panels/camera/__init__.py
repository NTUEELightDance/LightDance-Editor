import bpy

from ...properties.ui.types import CameraStatusType


class CameraPanel(bpy.types.Panel):
    bl_label = "Camera View Panel"
    bl_idname = "VIEW_PT_LightPreview"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightPreview"

    def draw(self, context):
        if not bpy.context:
            return
        layout = self.layout
        ld_camera_status: CameraStatusType = getattr(
            bpy.context.window_manager, "ld_ui_camera"
        )

        row = layout.row()
        row.operator(
            "view3d.toggle_camera_operator",
            text=(
                "Turn On"
                if not getattr(ld_camera_status, "camera_on", False)
                else "Turn Off"
            ),
        )

        # Show other buttons/slider when it's on
        if getattr(ld_camera_status, "camera_on", False):
            layout.label(text="Adjust Camera Position:")

            layout.prop(ld_camera_status, "camera_y", slider=True)
            row = layout.row()

            op = row.operator("view3d.set_camera_y", text="Left")
            setattr(op, "target_y", -10)

            op = row.operator("view3d.set_camera_y", text="Middle")
            setattr(op, "target_y", 0)

            op = row.operator("view3d.set_camera_y", text="Right")
            setattr(op, "target_y", 10)

            layout.prop(ld_camera_status, "camera_x", slider=True)
            row = layout.row()

            op = row.operator("view3d.set_camera_x", text="Front")
            setattr(op, "target_x", 4.5)

            op = row.operator("view3d.set_camera_x", text="Middle")
            setattr(op, "target_x", 10)

            op = row.operator("view3d.set_camera_x", text="Back")
            setattr(op, "target_x", 17.5)

            layout.prop(ld_camera_status, "camera_focal_length", slider=True)
            row = layout.row()

            op = row.operator("view3d.set_camera_focal", text="35mm")
            setattr(op, "target_focal_length", 35)

            op = row.operator("view3d.set_camera_focal", text="50mm")
            setattr(op, "target_focal_length", 50)

            op = row.operator("view3d.set_camera_focal", text="80mm")
            setattr(op, "target_focal_length", 80)

            row = layout.row()
            row.operator("view3d.auto_fit_fullscreen", text="Auto Fit to Fullscreen")

            layout.prop(ld_camera_status, "world_light_intensity", slider=True)


def register():
    bpy.utils.register_class(CameraPanel)


def unregister():
    bpy.utils.unregister_class(CameraPanel)
