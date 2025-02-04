import bpy
import mathutils


def update_camera(self, context):
    camera = bpy.data.objects.get("lightdance_camera")
    if camera:
        # update camera position
        camera.location.y = getattr(self, "camera_y")
        camera.location.x = max(4.5, min(getattr(self, "camera_x"), 17.5))

        # adjust z postion according to x
        if 4.5 <= camera.location.x <= 5.5:
            camera.location.z = (
                0.3 + (camera.location.x - 4.5) * 1.5
            )  # the first row is relatively low.
        else:
            camera.location.z = 1.8 + (camera.location.x - 5.5) * 0.2

        camera.data.lens = getattr(self, "camera_focal_length")  # type: ignore

        # Let camera face the center of the stage
        target = mathutils.Vector((0, 0, 1.5))
        direction = camera.location - target
        camera.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
        if not bpy.context:
            return
        bpy.context.view_layer.update()


def update_world_light(self, context):
    if not bpy.context:
        return
    world = bpy.context.scene.world
    if world and world.node_tree:
        node = world.node_tree.nodes.get("Background")
        if node:
            setattr(
                node.inputs[1], "default_value", getattr(self, "world_light_intensity")
            )


class CameraStatus(bpy.types.PropertyGroup):
    edit_index: bpy.props.IntProperty()  # type: ignore
    camera_on: bpy.props.BoolProperty(default=False)  # type: ignore
    camera_y: bpy.props.FloatProperty(name="Camera Y", min=-10, max=10, default=0, update=update_camera)  # type: ignore
    camera_x: bpy.props.FloatProperty(name="Camera X", min=4.5, max=17.5, default=4.5, update=update_camera)  # type: ignore
    camera_focal_length: bpy.props.FloatProperty(name="Focal Length", min=35, max=80, default=50, update=update_camera)  # type: ignore
    world_light_intensity: bpy.props.FloatProperty(  # type: ignore
        name="World Light", min=0, max=1, default=1, update=update_world_light
    )  # type: ignore


def register():
    bpy.utils.register_class(CameraStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_camera",
        bpy.props.PointerProperty(type=CameraStatus),
    )


def unregister():
    bpy.utils.unregister_class(CameraStatus)
    delattr(bpy.types.WindowManager, "ld_ui_camera")
