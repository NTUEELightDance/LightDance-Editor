import bpy

from ...core.utils.notification import notifications


class NotificationOperator(bpy.types.Operator):
    bl_idname = "lightdance.notification"
    bl_label = "Notification Operator"

    def modal(self, context: bpy.types.Context, event: bpy.types.Event):
        if event.type == "TIMER":
            while len(notifications) > 0:
                notification = notifications.pop()
                self.report(notification[0], notification[1])

            return {"PASS_THROUGH"}

        return {"PASS_THROUGH"}

    def invoke(self, context: bpy.types.Context, event: bpy.types.Event):
        context.window_manager.modal_handler_add(self)
        self._timer = context.window_manager.event_timer_add(
            0.01, window=context.window
        )

        return {"RUNNING_MODAL"}

    def execute(self, context: bpy.types.Context):
        return {"FINISHED"}

    def __del__(self):
        bpy.context.window_manager.event_timer_remove(self._timer)


def register():
    bpy.utils.register_class(NotificationOperator)


def unregister():
    bpy.utils.unregister_class(NotificationOperator)
