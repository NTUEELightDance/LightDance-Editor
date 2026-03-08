import threading
import time

import pygame

from ..api import api
from ..types.app import ControlScreenParamsType, ControlScreenType

pygame.init()
pygame.mixer.init()
pygame.mixer.music.load("../files/music/0307.wav")
START_MUSIC_EVENT = pygame.USEREVENT + 1
music_timer = None


def play_music():
    pygame.mixer.music.play()


def control_handler(
    id: str, selected_dancers: list[str], screen_ref: ControlScreenType, sender
):  # TODO
    # sender = ESP32BTSender(port="dev/tty3")
    screen_vars: ControlScreenParamsType = screen_ref.local_vars
    global music_timer
    match id:
        case "control-play":
            # timestamp = int(time.time() * 1000) + screen_vars.delay * 1000
            # timestamp = screen_vars.delay * 1000
            # pygame.time.set_timer(START_MUSIC_EVENT, screen_vars.delay * 1000)
            music_timer = threading.Timer(screen_vars.delay, play_music)
            music_timer.start()
            # api.send(
            #     {
            #         "topic": "play",
            #         "payload": {
            #             "dancers": selected_dancers,
            #             "timestamp": timestamp,
            #             "start": screen_vars.start_time,
            #         },
            #     }
            # )
            # screen_ref.notify(
            #     f"Play: delay={screen_vars.delay} / start time={screen_vars.start_time}"
            # )
            response = sender.send_burst(
                cmd_input="PLAY",
                delay_sec=screen_vars.delay,
                prep_led_sec=10.0,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify(
                f"Play: delay={screen_vars.delay} / start time={screen_vars.start_time}"
            )
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-pause":
            # api.send(
            #     {
            #         "topic": "pause",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="PAUSE",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Pause")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-stop":
            try:
                if music_timer:
                    music_timer.cancel()
                pygame.mixer.music.stop()
            except:
                screen_ref.notify("Nothing to stop!")
            api.send(
                {
                    "topic": "stop",
                    "payload": {
                        "dancers": selected_dancers,
                    },
                }
            )
            response = sender.send_burst(
                cmd_input="STOP",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Stop")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-refresh":
            # api.send(
            #     {
            #         "topic": "boardInfo",
            #     }
            # )
            response = sender.send_burst(
                cmd_input="RESET",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Reset")
        case "control-sync":
            # api.send(
            #     {
            #         "topic": "sync",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            # sender.connect()
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
            # api.send(
            #     {
            #         "topic": "load",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="UPLOAD",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Load")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-r":
            # api.send(
            #     {
            #         "topic": "red",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[255, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Red")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-g":
            # api.send(
            #     {
            #         "topic": "green",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 255, 0],
                # retries=3,
            )
            screen_ref.notify("Green")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-b":
            # api.send(
            #     {
            #         "topic": "blue",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 255],
                # retries=3,
            )
            screen_ref.notify("Blue")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-rg":
            # api.send(
            #     {
            #         "topic": "yellow",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[255, 255, 0],
                # retries=3,
            )
            screen_ref.notify("Yellow/RG")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-gb":
            # api.send(
            #     {
            #         "topic": "cyan",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 255, 255],
                # retries=3,
            )
            screen_ref.notify("Cyan/GB")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-rb":
            # api.send(
            #     {
            #         "topic": "magenta",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[255, 0, 255],
                # retries=3,
            )
            screen_ref.notify("Magenta/RB")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-d":
            # api.send(
            #     {
            #         "topic": "dark",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[0, 0, 0],
                # retries=3,
            )
            screen_ref.notify("Rainbow")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-w":
            # api.send(
            #     {
            #         "topic": "white",
            #         "payload": {
            #             "dancers": selected_dancers,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[255, 255, 255],
                # retries=3,
            )
            screen_ref.notify("White")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
        case "control-send-color":
            # api.send(
            #     {
            #         "topic": "color",
            #         "payload": {
            #             "dancers": selected_dancers,
            #             "colorCode": screen_vars.color_code,
            #         },
            #     }
            # )
            response = sender.send_burst(
                cmd_input="TEST",
                delay_sec=1,
                prep_led_sec=1,
                target_ids=[
                    int(dancer.split("_")[0]) + 1 for dancer in selected_dancers
                ],
                data=[
                    int(screen_vars.color_code[1:3], 16),
                    int(screen_vars.color_code[3:5], 16),
                    int(screen_vars.color_code[5:7], 16),
                ],
                # retries=3,
            )
            screen_ref.notify(f"Color: {screen_vars.color_code}")
            screen_ref.notify(
                f"BTSender Response: {str(response['payload']['message'])}"
            )
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
            screen_ref.notify(f"Command: {screen_vars.command} (abandoned)")
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
