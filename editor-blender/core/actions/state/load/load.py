import json
import os
from typing import Any, cast

from .....client import client
from ....config import config
from ....log import logger
from ....states import state
from ....utils.ui import update_user_log
from .animation import setup_animation_data
from .display import setup_display
from .music import setup_music
from .objects import setup_floor, setup_objects
from .render import setup_render


def parse_config(config_dict: dict[str, Any]):
    stage_config = config_dict["Stage"]

    setattr(config, "stage_width", cast(float, stage_config["width"]))
    setattr(config, "stage_length", cast(float, stage_config["length"]))
    setattr(config, "stage_scale", cast(float, stage_config["scale"]))


async def fetch_data(reload: bool = False):
    """
    Fetch assets from editor-server
    param reload: Fetch assets again even they already exist is true, otherwise only fetch missing assets.
    """
    use_draco = False

    if client.file_client:
        assets_load: dict[str, Any] = await client.download_json("/data/load.json")
        assets_load_hash: dict[str, Any] = await client.download_json(
            "/data/load_hash.json"
        )

        local_load_hash_path = os.path.normpath(config.ASSET_PATH + "/load_hash.json")
        new_load_hash = False
        local_load_hash: dict[str, Any] = {}

        if not os.path.exists(config.ASSET_PATH):
            os.makedirs(config.ASSET_PATH, exist_ok=True)

        if not os.path.exists(local_load_hash_path):
            with open(local_load_hash_path, "w") as file:
                json.dump(assets_load_hash, file)
            new_load_hash = True

        else:
            with open(
                os.path.normpath(config.ASSET_PATH + "/load_hash.json"), "r"
            ) as file:
                local_load_hash = json.load(file)

        try:
            url_set: set[tuple[str, bool]] = set()
            for tag in ["Beat", "Waveform", "Music", "LightPresets", "PosPresets"]:
                if tag not in local_load_hash:
                    local_load_hash[tag] = None
                hash_match = not new_load_hash and (
                    assets_load_hash[tag] == local_load_hash[tag]
                )
                url_set.add((assets_load[tag], hash_match))

                if not hash_match:
                    logger.warning(f"Hash mismatch for {tag}")

            dancer_model_update: dict[str, bool] = {}
            dancer_models_hash: dict[str, str] = {}
            for key in assets_load["DancerMap"]:
                raw_url = assets_load["DancerMap"][key]["url"]

                if use_draco:
                    model_url = raw_url
                else:
                    model_url = "".join(raw_url.split(".draco"))
                    assets_load["DancerMap"][key]["url"] = model_url

                dancer_models_hash[key] = assets_load_hash["DancerMap"][key]["url"]
                if not new_load_hash and key in local_load_hash["DancerMap"]:
                    hash_match = (
                        assets_load_hash["DancerMap"][key]["url"]
                        == local_load_hash["DancerMap"][key]["url"]
                    )
                else:
                    hash_match = False
                url_set.add((model_url, hash_match))

                if not hash_match:
                    logger.warning(f"Hash mismatch for DancerMap/{key}/url")
                    dancer_model_update[key] = True
                else:
                    dancer_model_update[key] = False

            parse_config(assets_load["Config"])

            for url, hash_match in url_set:
                file_path = os.path.normpath(config.ASSET_PATH + url)
                file_dir = os.path.dirname(file_path)
                if os.path.isfile(file_path) and not reload and hash_match:
                    continue

                if not os.path.exists(file_dir):
                    os.makedirs(file_dir)
                    logger.info(f"created folder: {file_dir}")

                data = await client.download_binary(url)
                logger.info(f"fetched file {url} from server")
                with open(file_path, "w+b") as file:
                    file.write(data)

            with open(local_load_hash_path, "w") as file:
                json.dump(assets_load_hash, file)

        except Exception:
            logger.exception("Failed to fetch assets")
            raise

    else:
        logger.exception("File client is not initialized")
        raise

    state.init_temps.assets_load = assets_load
    state.init_temps.dancer_model_update = dancer_model_update
    state.init_temps.dancer_models_hash = dancer_models_hash


async def init_assets():
    await update_user_log("Fetching data...")
    await fetch_data()

    setup_render()
    setup_display()

    await update_user_log("Setting up music...")
    setup_music(state.init_temps.assets_load)


async def load_data():
    await update_user_log("Setting up objects...")
    try:
        await setup_objects()
    except Exception:
        logger.exception("Failed to setup objects")
        raise
    setup_floor()

    await update_user_log("Setting up animation data...")
    setup_animation_data()
