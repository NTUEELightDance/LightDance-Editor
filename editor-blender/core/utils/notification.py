from typing import Literal

notifications: list[tuple[set[str], str]] = []


def notify(type: Literal["INFO", "WARNING", "ERROR"] = "INFO", message: str = ""):
    if type not in ["INFO", "WARNING", "ERROR"]:
        raise ValueError(f"Invalid notification type: {type}")
    notifications.append(({type}, message))
