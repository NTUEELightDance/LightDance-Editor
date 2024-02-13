import bpy

from ...api.command_agent import command_agent
from ...core.actions.property.command import get_selected_dancer
from ...core.actions.state.app_state import set_requesting
from ...core.states import state
from ...core.utils.convert import is_color_code
from ...core.utils.notification import notify
from ...graphqls.command import (
    ToControllerServerBoardInfoPartial,
    ToControllerServerCloseGPIOPartial,
    ToControllerServerColorPartial,
    ToControllerServerDarkAllPartial,
    ToControllerServerLoadPartial,
    ToControllerServerPausePartial,
    ToControllerServerPlayPartial,
    ToControllerServerRebootPartial,
    ToControllerServerStopPartial,
    ToControllerServerSyncPartial,
    ToControllerServerTestPartial,
    ToControllerServerUploadPartial,
    ToControllerServerWebShellPartial,
)
from ..async_core import AsyncOperator


class CommandCenterRefreshOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_refresh"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            info_payload = ToControllerServerBoardInfoPartial.from_dict(
                {"topic": "boardInfo"}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(info_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterSyncOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_sync"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerSyncPartial.from_dict(
                {"topic": "sync", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterPlayOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_play"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerPlayPartial.from_dict(
                {"topic": "sync", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterPauseOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_pause"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerPausePartial.from_dict(
                {"topic": "sync", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterStopOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_stop"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerStopPartial.from_dict(
                {"topic": "sync", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterLoadOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_load"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            load_payload = ToControllerServerLoadPartial.from_dict({"topic": "load"})
            # set_requesting(True)
            await command_agent.send_to_controller_server(load_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterUploadOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_upload"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            upload_payload = ToControllerServerUploadPartial.from_dict(
                {"topic": "upload", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(upload_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterRebootOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_reboot"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            reboot_payload = ToControllerServerRebootPartial.from_dict(
                {"topic": "reboot", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(reboot_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterTestOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_test"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            color_code = ""  # TODO
            if not is_color_code(color_code):
                notify("WARNING", "Invalid color code!")
                return {"CANCELLED"}
            sync_payload = ToControllerServerTestPartial.from_dict(
                {
                    "topic": "sync",
                    "payload": {
                        "dancers": get_selected_dancer(),
                        "colorCode": f"{color_code}",
                    },
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterColorOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_color"
    bl_label = ""

    color: bpy.props.EnumProperty(
        items=[  # type: ignore
            ("red", "red", ""),
            ("green", "green", ""),
            ("blue", "blue", ""),
            ("yellow", "yellow", ""),
            ("magenta", "magenta", ""),
            ("cyan", "cyan", ""),
        ]
    )

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            color_payload = ToControllerServerColorPartial.from_dict(
                {
                    "topic": f"{self.color}",
                    "payload": {"dancers": get_selected_dancer()},
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(color_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterDarkAllOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_dark_all"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            dark_all_payload = ToControllerServerDarkAllPartial.from_dict(
                {"topic": "darkAll", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(dark_all_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterCloseGPIOOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_close_gpio"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerCloseGPIOPartial.from_dict(
                {"topic": "close", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterWebShellOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_web_shell"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        command: str = ""  # TODO
        try:
            sync_payload = ToControllerServerWebShellPartial.from_dict(
                {
                    "topic": "sync",
                    "payload": {
                        "dancers": get_selected_dancer(),
                        "command": f"{command}",
                    },
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


ops_list = [
    CommandCenterRefreshOperator,
    CommandCenterCloseGPIOOperator,
    CommandCenterColorOperator,
    CommandCenterDarkAllOperator,
    CommandCenterLoadOperator,
    # CommandCenterPauseOperator,
    # CommandCenterPlayOperator,
    CommandCenterRebootOperator,
    # CommandCenterStopOperator,
    CommandCenterSyncOperator,
    CommandCenterTestOperator,
    CommandCenterUploadOperator,
    # CommandCenterWebShellOperator # TODO
]


def register():
    for op in ops_list:
        bpy.utils.register_class(op)


def unregister():
    for op in ops_list:
        bpy.utils.unregister_class(op)
