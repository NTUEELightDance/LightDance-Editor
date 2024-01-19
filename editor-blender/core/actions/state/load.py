import os

import bpy

from ....client import client
from ....properties.types import ObjectType
from ...states import state

asset_path = bpy.context.preferences.filepaths.asset_libraries["User Library"].path
target_path = os.path.join(asset_path, "LightDance")


async def fetch_data(reload: bool = False):
    """
    Fetch assets from editor-server
    param reload: Fetch assets again even they already exist is true, otherwise only fetch missing assets.
    """
    print("fetching data")
    if client.http_client:
        async with client.http_client.get("/data/load.json") as response:
            assets_load = await response.json()
        """ structure of assets_load (load.json):
        {
            "Music": "/music/2023-summer.mp3",
            "LightPresets": "/data/default_lightPresets.json",
            "PosPresets": "/data/default_posPresets.json",
            "DancerMap": {
                "1_vinc": {
                    "url": "/asset/models/agent.draco.glb",
                    "modelName": "agent"
                },
                "2_xN": {
                    "url": "/asset/models/assassin.draco.glb",
                    "modelName": "assassin"
                }
            }
        }
        """
        try:
            url_set = set()
            for tag in ["Music", "LightPresets", "PosPresets"]:
                url_set.add(assets_load[tag])
            for key in assets_load["DancerMap"]:
                url_set.add(assets_load["DancerMap"][key]["url"])
            for url in url_set:
                file_path = os.path.normpath(target_path + url)
                file_dir = os.path.dirname(file_path)
                if os.path.isfile(file_path) and not reload:
                    continue
                if not os.path.exists(file_dir):
                    os.makedirs(file_dir)
                    print("created folder: ", file_dir)
                async with client.http_client.get(url) as response:
                    data = await response.content.read()
                    print("fetched file ", url, "from server")
                    with open(file_path, "w+b") as file:
                        file.write(data)
        except Exception as e:
            print(e)
    else:
        raise Exception("HTTP client is not initialized")
    return assets_load


def setup_assets(assets_load):
    # clear all objects
    # bpy.ops.object.select_all(action='DESELECT')
    # bpy.ops.object.select_all()
    # bpy.ops.object.delete()
    view_3d = next(a for a in bpy.context.screen.areas if a.type == "VIEW_3D")
    setattr(view_3d.spaces.active.overlay, "show_relationship_lines", False)  # type: ignore
    # TODO: set view3d UI theme
    dancer_array = state.dancers_array
    for dancer in dancer_array:
        dancer_name = dancer.name
        dancer_load = assets_load["DancerMap"][dancer_name]
        if dancer_name in bpy.context.scene.objects.keys():
            continue
        dancer_file = dancer_load["url"]
        dancer_filepath = os.path.normpath(target_path + dancer_file)
        dancer_parent = bpy.data.objects.new(dancer_name, None)
        setattr(dancer_parent, "ld_object_type", ObjectType.DANCER.value)
        bpy.context.scene.collection.objects.link(dancer_parent)
        bpy.ops.import_scene.gltf(
            filepath=dancer_filepath
        )  # here all parts of dancer is selected
        dancer_objects = bpy.context.selected_objects
        dancer_human = next(obj for obj in dancer_objects if obj.name[0:5] == "Human")
        dancer_human.name = f"{dancer.name}.Human"
        dancer_human.parent = dancer_parent
        setattr(dancer_human, "ld_object_type", ObjectType.HUMAN.value)
        # setattr(dancer_human, "ld_light_type", item.type.value) --> delete?
        # setattr(dancer_human, "ld_part_name", item.name)  -------'
        for item in dancer.parts:
            part_objects = [i for i in dancer_objects if i.name.find(item.name) >= 0]
            if len(part_objects) == 0:
                print("Dancer part not found (maybe should reload asset)")
            if item.type.value == "LED":
                parts_parent = bpy.data.objects.new(
                    f"{dancer.name}.{item.name}.parent", None
                )
                bpy.context.scene.collection.objects.link(parts_parent)
                parts_parent.parent = dancer_parent
                setattr(parts_parent, "ld_object_type", ObjectType.LIGHT.value)
                setattr(parts_parent, "ld_light_type", item.type.value.lower())
                setattr(parts_parent, "ld_part_name", item.name)
                for obj in part_objects:
                    obj.name = f"{dancer.name}.{item.name}"
                    obj.parent = parts_parent
                    setattr(obj, "ld_object_type", ObjectType.LIGHT.value)
                    setattr(obj, "ld_light_type", item.type.value.lower())
                    setattr(obj, "ld_part_name", item.name)
            elif item.type.value == "FIBER":
                obj = part_objects[0]
                obj.name = f"{dancer.name}.{item.name}"
                obj.parent = dancer_parent
                setattr(obj, "ld_object_type", "light")
                setattr(obj, "ld_light_type", item.type.value.lower())
                setattr(obj, "ld_part_name", item.name)

    # TODO: Setup keyframes from control map and position map
    # TODO:


async def load_data() -> None:
    assets_load = await fetch_data()
    try:
        setup_assets(assets_load)
    except Exception as e:
        print(e)
    print("data loaded")
