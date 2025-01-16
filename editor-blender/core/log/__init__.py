import logging
import shutil
import subprocess
import sys

from ..config import config

log_to_console = True
log_to_file = True


class CustomFormatter(logging.Formatter):
    green = "\x1b[32;21m"
    yellow = "\x1b[33;21m"
    red = "\x1b[31;21m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    log_format = "[%(asctime)s] %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"

    FORMATS = {
        logging.DEBUG: f"{log_format}{reset}",
        logging.INFO: f"{log_format}{reset}",
        logging.WARNING: f"{yellow}{log_format}{reset}",
        logging.ERROR: f"{red}{log_format}{reset}",
        logging.CRITICAL: f"{bold_red}{log_format}{reset}",
    }

    def format(self, record):
        log_format = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_format, "%m/%d %H:%M:%S")
        return formatter.format(record)


def get_logger():
    logger = logging.getLogger("LightDance")
    logger.setLevel(logging.DEBUG)

    if log_to_console:
        ch = logging.StreamHandler()
        ch.setLevel(logging.DEBUG)
        ch.setFormatter((CustomFormatter()))
        logger.addHandler(ch)

    if log_to_file:
        fh = logging.FileHandler(config.LOG_PATH)
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(CustomFormatter())
        logger.addHandler(fh)

    return logger


logger = get_logger()


class LogWindow:
    def __init__(self):
        self.process = None

    def open(self):
        """Opens a new terminal window and tails the log file."""

        UNIX_COMMAND = f"tail -f {config.LOG_PATH} -n 5"
        WINDOWS_COMMAND = f'Get-Content "{config.LOG_PATH}" -Wait'

        if sys.platform.startswith("win"):
            self.process = subprocess.Popen(
                [
                    "start",
                    "powershell",
                    "-NoExit",
                    "-Command",
                    WINDOWS_COMMAND,
                ],
                shell=True,
                stdin=subprocess.PIPE,
            )
        elif sys.platform.startswith("darwin"):
            self.process = subprocess.Popen(
                [
                    "open",
                    "-a",
                    "Terminal",
                    "-n",
                    "--args",
                    "bash",
                    "-c",
                    UNIX_COMMAND,
                ],
                stdin=subprocess.PIPE,
            )
        else:
            # NOTE: Only support gnome-terminal and konsole currently
            if shutil.which("konsole"):
                self.process = subprocess.Popen(
                    [
                        "konsole",
                        "--hold",
                        "-e",
                        "bash",
                        "-c",
                        UNIX_COMMAND,
                    ],
                    stdin=subprocess.PIPE,
                )
            elif shutil.which("gnome-terminal"):
                self.process = subprocess.Popen(
                    [
                        "gnome-terminal",
                        "--",
                        "bash",
                        "-c",
                        UNIX_COMMAND,
                    ],
                    stdin=subprocess.PIPE,
                )
            else:
                logger.error("Unsupported platform for opening log window.")
                return
        logger.info("\x1b[32;1mLog window opened.\x1b[0m")

    def close(self):
        if self.process:
            self.process.terminate()
            self.process = None
        logger.info("Log window closed.")


log_window = LogWindow()
