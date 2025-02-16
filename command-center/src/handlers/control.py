def control_handler(id: str):  # TODO
    match id:
        case "control-play":
            print("Play")
        case "control-pause":
            print("Pause")
        case "control-stop":
            print("Stop")
        case "control-reconnect":
            print("Reconnect")
        case "control-sync":
            print("Sync")
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
