import logging

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
        # fh = logging.FileHandler("log.txt")
        fh.setLevel(logging.DEBUG)
        fh.setFormatter(CustomFormatter())
        logger.addHandler(fh)

    return logger


logger = get_logger()
