import os
from os import path
from typing import cast

import bpy
from dotenv import load_dotenv


def remove_wrapped_slash(path: str) -> str:
    if path.startswith("/"):
        return path[1:]
    return path


class Config:
    def __init__(self):
        pass

    def initialize(self):
        """
        Dotenv
        """
        current_dir = path.dirname(path.realpath(__file__))
        root_dir = path.dirname(path.dirname(current_dir))
        dotenv_path = path.join(root_dir, ".env")
        load_dotenv(dotenv_path=dotenv_path)

        SERVER_URL = os.getenv("SERVER_URL")
        if SERVER_URL is None:
            raise Exception("SERVER_URL is not defined")
        self.SERVER_URL = remove_wrapped_slash(SERVER_URL)

        HTTP_PATH = os.getenv("HTTP_PATH")
        if HTTP_PATH is None:
            raise Exception("HTTP_PATH is not defined")
        self.HTTP_PATH = remove_wrapped_slash(HTTP_PATH)

        GRAPHQL_PATH = os.getenv("GRAPHQL_PATH")
        if GRAPHQL_PATH is None:
            raise Exception("GRAPHQL_PATH is not defined")
        self.GRAPHQL_PATH = remove_wrapped_slash(GRAPHQL_PATH)

        GRAPHQL_WS_PATH = os.getenv("GRAPHQL_WS_PATH")
        if GRAPHQL_WS_PATH is None:
            raise Exception("GRAPHQL_WS_PATH is not defined")
        self.GRAPHQL_WS_PATH = remove_wrapped_slash(GRAPHQL_WS_PATH)

        FILE_SERVER_URL = os.getenv("FILE_SERVER_URL")
        if FILE_SERVER_URL is None:
            raise Exception("FILE_SERVER_URL is not defined")
        self.FILE_SERVER_URL = remove_wrapped_slash(FILE_SERVER_URL)

        CONTROLLER_WS_URL = os.getenv("CONTROLLER_WS_URL")
        if CONTROLLER_WS_URL is None:
            raise Exception("CONTROLLER_WS_URL is not defined")
        self.CONTROLLER_WS_URL = remove_wrapped_slash(CONTROLLER_WS_URL)

        """
        Assets
        """
        library_path = cast(
            str,
            (
                bpy.context.preferences.filepaths.asset_libraries["User Library"].path
                if bpy.context
                else ""
            ),
        )
        self.ASSET_PATH = os.path.join(library_path, "LightDance")


config = Config()
