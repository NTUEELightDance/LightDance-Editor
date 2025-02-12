import bpy
import mathutils

from ...properties.ui.types import CameraStatusType


def toggle_camera_view(context):
    if not bpy.context:
        return
    scene = context.scene
    area = next(area for area in context.screen.areas if area.type == "VIEW_3D")

    # Control On/Off based on whether the user is in Camera View
    if area.spaces[0].region_3d.view_perspective != "CAMERA":
        area.spaces[0].region_3d.view_perspective = "CAMERA"

        # Ensure 'lightdance_camera' Camera
        camera = bpy.data.objects.get("lightdance_camera")
        if not camera:
            bpy.ops.object.camera_add()
            camera = bpy.context.object
            camera.name = "lightdance_camera"  # type: ignore
            camera.hide_select = True  # type: ignore

        scene.camera = camera

        # Default location and rotaion.
        if not camera:
            return
        camera.location = mathutils.Vector((10, 0, 2.7))
        target = mathutils.Vector((0, 0, 1.5))
        direction = camera.location - target
        camera.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()

        # Remember the previous location and rotaion.
        scene["pre_camera_location"] = area.spaces[0].region_3d.view_location.copy()
        scene["pre_camera_rotation"] = area.spaces[0].region_3d.view_rotation.copy()

        # Switch rendering modes and set rendering-related settings
        if not bpy.context:
            return
        bpy.context.space_data.shading.type = "RENDERED"  # type: ignore
        bpy.context.space_data.overlay.show_overlays = False  # type: ignore
        bpy.context.scene.render.engine = "BLENDER_EEVEE_NEXT"
        bpy.context.scene.eevee.use_raytracing = True
        bpy.context.scene.eevee.ray_tracing_options.resolution_scale = "1"
        bpy.context.scene.eevee.ray_tracing_options.trace_max_roughness = 0.95
        bpy.context.space_data.lock_camera = True  # type: ignore
    else:
        # Return to the original location/rotation.
        if "pre_camera_location" in scene and "pre_camera_rotation" in scene:
            area.spaces[0].region_3d.view_location = scene["pre_camera_location"]
            area.spaces[0].region_3d.view_rotation = scene["pre_camera_rotation"]

        area.spaces[0].region_3d.view_perspective = "PERSP"
        bpy.context.space_data.shading.type = "SOLID"  # type: ignore
        bpy.context.space_data.overlay.show_overlays = True  # type: ignore


class SetCameraY(bpy.types.Operator):
    bl_idname = "view3d.set_camera_y"
    bl_label = "Set Camera Y"
    target_y: bpy.props.FloatProperty()  # type: ignore

    def execute(self, context):
        camera = bpy.data.objects.get("lightdance_camera")
        if not bpy.context:
            return {"CANCELLED"}
        ld_camera_status: CameraStatusType = getattr(
            bpy.context.window_manager, "ld_ui_camera"
        )

        if camera:
            camera.location.y = self.target_y
            ld_camera_status.camera_y = self.target_y  # Update the value on slider

        return {"FINISHED"}


class SetCameraX(bpy.types.Operator):
    bl_idname = "view3d.set_camera_x"
    bl_label = "Set Camera X"
    target_x: bpy.props.FloatProperty()  # type: ignore

    def execute(self, context):
        camera = bpy.data.objects.get("lightdance_camera")
        if not bpy.context:
            return {"CANCELLED"}
        ld_camera_status: CameraStatusType = getattr(
            bpy.context.window_manager, "ld_ui_camera"
        )

        if camera:
            camera.location.x = self.target_x
            ld_camera_status.camera_x = self.target_x  # Updtate the value on slider

        return {"FINISHED"}


class SetCameraFocal(bpy.types.Operator):
    bl_idname = "view3d.set_camera_focal"
    bl_label = "Set Camera Focal Length"
    target_focal_length: bpy.props.FloatProperty()  # type: ignore

    def execute(self, context):
        if not bpy.context:
            return {"CANCELLED"}
        camera = bpy.data.objects.get("lightdance_camera")

        ld_camera_status: CameraStatusType = getattr(
            bpy.context.window_manager, "ld_ui_camera"
        )

        if camera:
            camera.data.lens = self.target_focal_length  # type: ignore
            ld_camera_status.camera_focal_length = (
                self.target_focal_length
            )  # Update the value on slider

        return {"FINISHED"}


class ToggleCameraOperator(bpy.types.Operator):
    bl_idname = "view3d.toggle_camera_operator"
    bl_label = "Toggle Camera View"

    def execute(self, context):
        if not bpy.context:
            return {"CANCELLED"}
        ld_camera_status: CameraStatusType = getattr(
            bpy.context.window_manager, "ld_ui_camera"
        )
        setattr(
            ld_camera_status, "camera_on", not getattr(ld_camera_status, "camera_on")
        )
        toggle_camera_view(context)

        return {"FINISHED"}


class AutoFitFullscreenOperator(bpy.types.Operator):
    bl_idname = "view3d.auto_fit_fullscreen"
    bl_label = "Auto Fit to Fullscreen"

    def execute(self, context):
        bpy.ops.view3d.view_center_camera()
        return {"FINISHED"}


def register():
    bpy.utils.register_class(ToggleCameraOperator)
    bpy.utils.register_class(SetCameraX)
    bpy.utils.register_class(SetCameraY)
    bpy.utils.register_class(SetCameraFocal)
    bpy.utils.register_class(AutoFitFullscreenOperator)


def unregister():
    bpy.utils.unregister_class(ToggleCameraOperator)
    bpy.utils.unregister_class(SetCameraX)
    bpy.utils.unregister_class(SetCameraY)
    bpy.utils.unregister_class(SetCameraFocal)
    bpy.utils.unregister_class(AutoFitFullscreenOperator)
