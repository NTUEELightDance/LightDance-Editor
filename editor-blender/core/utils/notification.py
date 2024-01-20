from typing import List, Set, Tuple

notifications: List[Tuple[Set[str], str]] = []


def notify(type: str = "INFO", message: str = ""):
    if type not in ["INFO", "WARNING", "ERROR"]:
        raise ValueError(f"Invalid notification type: {type}")
    notifications.append(({type}, message))
