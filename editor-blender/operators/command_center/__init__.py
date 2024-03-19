import time
import traceback

import bpy

from ...api.command_agent import command_agent
from ...client import client
from ...client.subscription import subscribe_command
from ...core.actions.property.command import (
    countdown_task,
    get_selected_dancer,
    set_command_status,
    set_countdown,
)
from ...core.actions.state.app_state import set_requesting
from ...core.actions.state.load import init_assets
from ...core.asyncio import AsyncTask
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
from ...properties.ui.types import CommandCenterStatusType
from ..async_core import AsyncOperator


class CommandCenterStartOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_start"
    bl_label = ""
    bl_description = "Connect to controller server."

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            await client.open_command()
            if state.command_task is not None:
                state.command_task.cancel()
            state.command_task = AsyncTask(subscribe_command).exec()

            info_payload = ToControllerServerBoardInfoPartial.from_dict(
                {"topic": "boardInfo"}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(info_payload)
            set_command_status(True)
            await init_assets()

        except Exception as e:
            traceback.print_exc()
            raise Exception(f"Can't connect to controller server: {e}")
        return {"FINISHED"}


class CommandCenterRefreshOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_refresh"
    bl_label = ""
    bl_description = "Reconnect to controller server"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            await client.restart_command()
            set_command_status(True)
            info_payload = ToControllerServerBoardInfoPartial.from_dict(
                {"topic": "boardInfo"}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(info_payload)

        except Exception as e:
            # set_requesting(False)
            traceback.print_exc()
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterSyncOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_sync"
    bl_label = ""
    bl_description = "Sync RPi status from controller server"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerSyncPartial.from_dict(
                {"topic": "sync", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterPlayOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_play"
    bl_label = "Play with delay"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        command_status: CommandCenterStatusType = getattr(
            bpy.context.window_manager, "ld_ui_command_center"
        )
        set_countdown(command_status.delay)
        start_timestamp_ms = int(time.time() * 1000) + command_status.delay * 1000
        try:
            play_payload = ToControllerServerPlayPartial.from_dict(
                {
                    "topic": "play",
                    "payload": {
                        "dancers": get_selected_dancer(),
                        "start": bpy.context.scene.frame_current,
                        "timestamp": start_timestamp_ms,
                    },
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(play_payload)
            state.last_play_timestamp_ms = start_timestamp_ms

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterPauseOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_pause"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        # bpy.ops.screen.animation_cancel(restore_frame=False)
        try:
            pause_payload = ToControllerServerPausePartial.from_dict(
                {"topic": "pause", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(pause_payload)
            time_since_last_play_ms = (
                int(time.time() * 1000) - state.last_play_timestamp_ms
            )
            if time_since_last_play_ms < 600000:
                bpy.context.scene.frame_current += time_since_last_play_ms

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterStopOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_stop"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        # bpy.ops.screen.animation_cancel(restore_frame=True)
        if countdown_task.task:
            countdown_task.task.cancel()
            countdown_task.task = None
        command_status: CommandCenterStatusType = getattr(
            bpy.context.window_manager, "ld_ui_command_center"
        )
        command_status.countdown = "00:00"
        try:
            stop_payload = ToControllerServerStopPartial.from_dict(
                {"topic": "stop", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(stop_payload)
            bpy.context.scene.frame_current = 0

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterLoadOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_load"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            load_payload = ToControllerServerLoadPartial.from_dict(
                {"topic": "load", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(load_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterUploadOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_upload"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            upload_payload = ToControllerServerUploadPartial.from_dict(
                {"topic": "upload", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(upload_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterRebootOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_reboot"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            reboot_payload = ToControllerServerRebootPartial.from_dict(
                {"topic": "reboot", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(reboot_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterTestOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_test"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            command_status: CommandCenterStatusType = getattr(
                bpy.context.window_manager, "ld_ui_command_center"
            )
            color_code = command_status.color_code
            if not is_color_code(color_code):
                notify("WARNING", "Invalid color code!")
                return {"CANCELLED"}
            sync_payload = ToControllerServerTestPartial.from_dict(
                {
                    "topic": "test",
                    "payload": {
                        "dancers": get_selected_dancer(),
                        "colorCode": f"{color_code}",
                    },
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterColorOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_color"
    bl_label = ""

    # color: bpy.props.EnumProperty([ # type: ignore
    #     ("red", "red", ""),
    #     ("green", "green", ""),
    #     ("blue", "blue", ""),
    #     ("yellow", "yellow", ""),
    #     ("cyan", "cyan", ""),
    #     ("magenta", "magenta", "")
    # ])
    color: bpy.props.StringProperty()  # type: ignore

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

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
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterDarkAllOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_dark_all"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            dark_all_payload = ToControllerServerDarkAllPartial.from_dict(
                {"topic": "darkAll", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(dark_all_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterCloseGPIOOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_close_gpio"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        try:
            sync_payload = ToControllerServerCloseGPIOPartial.from_dict(
                {"topic": "close", "payload": {"dancers": get_selected_dancer()}}
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


class CommandCenterWebShellOperator(AsyncOperator):
    bl_idname = "lightdance.command_center_web_shell"
    bl_label = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

    async def async_execute(self, context: bpy.types.Context):
        command_status: CommandCenterStatusType = getattr(
            bpy.context.window_manager, "ld_ui_command_center"
        )
        command: str = command_status.command
        try:
            sync_payload = ToControllerServerWebShellPartial.from_dict(
                {
                    "topic": "webShell",
                    "payload": {
                        "dancers": get_selected_dancer(),
                        "command": f"{command}",
                    },
                }
            )
            # set_requesting(True)
            await command_agent.send_to_controller_server(sync_payload)

        except Exception as e:
            traceback.print_exc()
            # set_requesting(False)
            raise Exception(f"Can't send message to controller server: {e}")
        return {"FINISHED"}


ops_list = [
    CommandCenterRefreshOperator,
    CommandCenterCloseGPIOOperator,
    CommandCenterColorOperator,
    CommandCenterDarkAllOperator,
    CommandCenterLoadOperator,
    CommandCenterPauseOperator,
    CommandCenterPlayOperator,
    CommandCenterRebootOperator,
    CommandCenterStopOperator,
    CommandCenterStartOperator,
    CommandCenterSyncOperator,
    CommandCenterTestOperator,
    CommandCenterUploadOperator,
    CommandCenterWebShellOperator,
]


def register():
    try:
        for op in ops_list:
            bpy.utils.register_class(op)

    except Exception:
        traceback.print_exc()


def unregister():
    try:
        for op in ops_list:
            bpy.utils.unregister_class(op)

    except Exception:
        traceback.print_exc()
