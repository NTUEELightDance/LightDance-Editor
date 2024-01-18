import bpy
from ....client import client
import os

asset_path = bpy.context.preferences.filepaths.asset_libraries['User Library'].path
target_path = os.path.join(asset_path, "LightDance")

async def fetch_data(reload: bool):
    """
    Fetch assets from editor-server
    reload: Fetch assets again even they already exist is true, otherwise only fetch missing assets.
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
            for key in assets_load['DancerMap']:
                url_set.add(assets_load['DancerMap'][key]['url'])
            for url in url_set:
                file_path = os.path.normpath(target_path+url)
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
    setattr(view_3d.spaces.active.overlay,"show_relationship_lines", False) # type: ignore
    for dancer_name, dancer in assets_load['DancerMap'].items():
        dancer_file = dancer["url"]
        dancer_path = os.path.normpath(target_path+dancer_file)
        dancer_parent = bpy.data.objects.new(dancer_name, None)
        setattr(dancer_parent, "ld_object_type", "dancer")
        bpy.context.scene.collection.objects.link(dancer_parent)
        bpy.ops.import_scene.gltf(filepath=dancer_path) # here all parts of dancer is selected
        dancer_parts = bpy.context.selected_objects
        for part in dancer_parts:
            if part.name.split(".")[0] == "Human":
                setattr(part, "ld_object_type", "human")
            else:
                setattr(part, "ld_object_type", "light")
            part.parent = dancer_parent
        
    # TODO: Setup dancers from assets
        # TODO: Set hierarchy // blender auto selects all imported objects
    # TODO: Setup keyframes from control map and position map
    # TODO: 

async def load_data() -> None:
    assets_load = await fetch_data(False)
    try:  
        setup_assets(assets_load)
    except Exception as e:
        print(e)
    print("data loaded")
