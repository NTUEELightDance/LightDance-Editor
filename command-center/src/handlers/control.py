from ..api import api


def control_handler(id: str, selected_dancers: list[str]):  # TODO
    match id:
        case "control-play":
            print("Play")
        case "control-pause":
            print("Pause")
        case "control-stop":
            print("Stop")
        case "control-refresh":
            api.send(
                {
                    "topic": "boardInfo",
                }
            )
        case "control-sync":
            api.send(
                {
                    "topic": "sync",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
        case "control-upload":
            print("Upload")
        case "control-load":
            print("Load")
        case "control-r":
            print("R")
        case "control-g":
            print("G")
        case "control-b":
            print("B")
        case "control-rg":
            print("RG")
        case "control-gb":
            print("GB")
        case "control-rb":
            print("RB")
        case "control-send-color":
            print("Send color")
        case "control-send-command":
            print("Send Command")
        case "control-close-gpio":
            print("Close GPIO")
        case "control-reboot":
            print("Reboot")
        case "control-restart-player":
            print("Restart Player")
        case _:
            print(f"Unknown button {id}")
