import bpy

from ...core.log import logger
from ...core.utils.notification import notifications

is_notification_running = False


class NotificationOperator(bpy.types.Operator):
    bl_idname = "lightdance.notification"
    bl_label = "Notification Operator"

    def modal(self, context: bpy.types.Context | None, event: bpy.types.Event):
        global is_notification_running

        if not is_notification_running:
            return {"FINISHED"}
        if event.type == "TIMER":
            while len(notifications) > 0:
                notification = notifications.pop()
                self.report(notification[0], notification[1])

            return {"PASS_THROUGH"}

        return {"PASS_THROUGH"}

    def invoke(self, context: bpy.types.Context | None, event: bpy.types.Event):
        global is_notification_running

        if not context:
            return {"CANCELLED"}
        if is_notification_running:
            return {"PASS_THROUGH"}

        context.window_manager.modal_handler_add(self)
        is_notification_running = True

        logger.info("Starting notification...")

        return {"RUNNING_MODAL"}

    def execute(self, context: bpy.types.Context | None):
        return {"FINISHED"}

    def __del__(self):
        global is_notification_running

        logger.info("Stopping notification...")

        is_notification_running = False


def register():
    bpy.utils.register_class(NotificationOperator)


def unregister():
    bpy.utils.unregister_class(NotificationOperator)
