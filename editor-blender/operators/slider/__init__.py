import bpy

from ...core.utils.operator import execute_slider_dragging_callback


class SliderDraggingListener(bpy.types.Operator):
    bl_idname = "lightdance.slider_dragging_listener"
    bl_label = "Listens for slider dragging"

    def modal(self, context: bpy.types.Context, event: bpy.types.Event):
        wm = context.window_manager
        dragging_slider = getattr(wm, "dragging_slider")

        if not dragging_slider:
            execute_slider_dragging_callback()
            return {"FINISHED"}

        if event.value == "RELEASE":
            setattr(wm, "dragging_slider", False)

        return {"PASS_THROUGH"}

    def invoke(self, context: bpy.types.Context, event: bpy.types.Event):
        if event.type == "LEFTMOUSE":
            print("Drag")
            wm = context.window_manager
            wm.modal_handler_add(self)

            setattr(wm, "dragging_slider", True)

            return {"RUNNING_MODAL"}

        else:
            return {"PASS_THROUGH"}


def register():
    setattr(
        bpy.types.WindowManager,
        "dragging_slider",
        bpy.props.BoolProperty(default=False),
    )
    bpy.utils.register_class(SliderDraggingListener)


def unregister():
    delattr(bpy.types.WindowManager, "dragging_slider")
    bpy.utils.unregister_class(SliderDraggingListener)
