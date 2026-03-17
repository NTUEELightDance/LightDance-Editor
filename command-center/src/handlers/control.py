import threading
import time
import wave

import pygame

from ..api import api
from ..config import MUSIC_FILE_PATH
from ..types.app import ControlScreenParamsType, ControlScreenType

START_MUSIC_EVENT = pygame.USEREVENT + 1
music_timer = None
play_cmd = None


def play_music():
    pygame.mixer.music.play()


def control_handler(
    id: str, selected_dancers: list[str], screen_ref: ControlScreenType, sender
):  # TODO
    # sender = ESP32BTSender(port="dev/tty3")
    screen_vars: ControlScreenParamsType = screen_ref.local_vars
    global music_timer
    global play_cmd
    if id == "control-play":
        music_timer = threading.Timer(screen_vars.delay, play_music)
        music_timer.start()
        response = sender.send_burst(
            cmd_input="PLAY",
            delay_sec=screen_vars.delay,
            prep_led_sec=10.0,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        play_cmd = int(response["payload"]["command_id"])
        screen_ref.notify(
            f"Play: delay={screen_vars.delay} / start time={screen_vars.start_time}"
        )
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-pause":
        response = sender.send_burst(
            cmd_input="PAUSE",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Pause")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-stop":
        try:
            if music_timer:
                music_timer.cancel()
                music_timer = None
            pygame.mixer.music.stop()
            if play_cmd is not None:
                sender.send_burst(
                    cmd_input="CANCEL",
                    delay_sec=1,
                    prep_led_sec=1,
                    target_ids=[
                        int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                    ],
                    data=[play_cmd, 0, 0],
                    # retries=3,
                )
                play_cmd = None
        except:
            screen_ref.notify("Nothing to stop!")
        response = sender.send_burst(
            cmd_input="STOP",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Stop")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-refresh":
        response = sender.send_burst(
            cmd_input="RESET",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Reset")
    elif id == "control-sync":
        screen_ref.notify("Sync")
    elif id == "control-upload":
        # api.send(
        #     {
        #         "topic": "upload",
        #         "payload": {
        #             "dancers": selected_dancers,
        #         },
        #     }
        # )
        api.download([int(dancer.split("_")[0]) + 1 for dancer in selected_dancers])
        screen_ref.notify("Download")
    elif id == "control-load":
        response = sender.send_burst(
            cmd_input="UPLOAD",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Upload")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-r":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[255, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Red")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-g":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 255, 0],
            # retries=3,
        )
        screen_ref.notify("Green")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-b":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 255],
            # retries=3,
        )
        screen_ref.notify("Blue")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-rg":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[255, 255, 0],
            # retries=3,
        )
        screen_ref.notify("Yellow/RG")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-gb":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 255, 255],
            # retries=3,
        )
        screen_ref.notify("Cyan/GB")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-rb":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[255, 0, 255],
            # retries=3,
        )
        screen_ref.notify("Magenta/RB")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-d":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[0, 0, 0],
            # retries=3,
        )
        screen_ref.notify("Rainbow")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-w":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[255, 255, 255],
            # retries=3,
        )
        screen_ref.notify("White")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-send-color":
        response = sender.send_burst(
            cmd_input="TEST",
            delay_sec=1,
            prep_led_sec=1,
            target_ids=[int(dancer.split("_")[0]) + 1 for dancer in selected_dancers],
            data=[
                int(screen_vars.color_code[1:3], 16),
                int(screen_vars.color_code[3:5], 16),
                int(screen_vars.color_code[5:7], 16),
            ],
            # retries=3,
        )
        screen_ref.notify(f"Color: {screen_vars.color_code}")
        if response["statusCode"] == 0:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        else:
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}",
                severity="error",
            )
    elif id == "control-send-command":
        api.send(
            {
                "topic": "webShell",
                "payload": {
                    "dancers": selected_dancers,
                    "command": screen_vars.command,
                },
            }
        )
        screen_ref.notify(f"Command: {screen_vars.command} (abandoned)")
    elif id == "control-connect-serial":
        screen_ref.notify("Connect")
    elif id == "control-load-music":
        MUSIC_FILE_PATH = screen_vars.music
        try:
            file_wav = wave.open(MUSIC_FILE_PATH)
            frequency = file_wav.getframerate()
            pygame.mixer.pre_init(frequency=frequency, size=-16, channels=2)
            pygame.init()
            pygame.mixer.init(frequency=frequency, size=-16, channels=2)
            # print(pygame.mixer.get_init())
            pygame.mixer.music.load(MUSIC_FILE_PATH)
            screen_ref.notify("Music loaded")
        except:
            screen_ref.notify("Failed to load the music!", severity="error")
    elif id == "control-danger-close-gpio":
        api.send(
            {
                "topic": "close",
                "payload": {
                    "dancers": selected_dancers,
                },
            }
        )
        screen_ref.notify("Close GPIO")
    elif id == "control-danger-reboot":
        api.send(
            {
                "topic": "reboot",
                "payload": {
                    "dancers": selected_dancers,
                },
            }
        )
        screen_ref.notify("Reboot")
    elif id == "control-danger-forced-restart":
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
    else:
        screen_ref.notify(f"Unknown button {id}")
