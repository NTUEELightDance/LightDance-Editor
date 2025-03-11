import time

from ..api import api
from ..types.app import ControlScreenParamsType, ControlScreenType


def control_handler(
    id: str, selected_dancers: list[str], screen_ref: ControlScreenType
):  # TODO
    screen_vars: ControlScreenParamsType = screen_ref.local_vars
    match id:
        case "control-play":
            timestamp = int(time.time() * 1000) + screen_vars.delay * 1000
            api.send(
                {
                    "topic": "play",
                    "payload": {
                        "dancers": selected_dancers,
                        "timestamp": timestamp,
                        "start": screen_vars.start_time,
                    },
                }
            )
            screen_ref.notify(
                f"Play: delay={screen_vars.delay} / start time={screen_vars.start_time}"
            )
        case "control-pause":
            api.send(
                {
                    "topic": "pause",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Pause")
        case "control-stop":
            api.send(
                {
                    "topic": "stop",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Stop")
        case "control-refresh":
            api.send(
                {
                    "topic": "boardInfo",
                }
            )
            screen_ref.notify("Refresh")
        case "control-sync":
            api.send(
                {
                    "topic": "sync",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Sync")
        case "control-upload":
            api.send(
                {
                    "topic": "upload",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Upload")
        case "control-load":
            api.send(
                {
                    "topic": "load",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Load")
        case "control-r":
            api.send(
                {
                    "topic": "red",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Red")
        case "control-g":
            api.send(
                {
                    "topic": "green",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Green")
        case "control-b":
            api.send(
                {
                    "topic": "blue",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Blue")
        case "control-rg":
            api.send(
                {
                    "topic": "yellow",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Yellow/RG")
        case "control-gb":
            api.send(
                {
                    "topic": "cyan",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Cyan/GB")
        case "control-rb":
            api.send(
                {
                    "topic": "magenta",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Magenta/RB")
        case "control-d":
            api.send(
                {
                    "topic": "dark",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Dark")
        case "control-w":
            api.send(
                {
                    "topic": "white",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("White")
        case "control-send-color":
            api.send(
                {
                    "topic": "color",
                    "payload": {
                        "dancers": selected_dancers,
                        "colorCode": screen_vars.color_code,
                    },
                }
            )
            screen_ref.notify(f"Color: {screen_vars.color_code}")
        case "control-send-command":
            api.send(
                {
                    "topic": "webShell",
                    "payload": {
                        "dancers": selected_dancers,
                        "command": screen_vars.command,
                    },
                }
            )
            screen_ref.notify(f"Command: {screen_vars.command}")
        case "control-danger-close-gpio":
            api.send(
                {
                    "topic": "close",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Close GPIO")
        case "control-danger-reboot":
            api.send(
                {
                    "topic": "reboot",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            screen_ref.notify("Reboot")
        case "control-danger-forced-restart":
            api.send(
                {
                    "topic": "webShell",
                    "payload": {
                        "dancers": selected_dancers,
                        "command": "sudo systemctl restart player.service",
                    },
                }
            )
            screen_ref.notify("Forced Restart")
        case _:
            screen_ref.notify(f"Unknown button {id}")
