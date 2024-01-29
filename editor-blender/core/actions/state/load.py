import os
from typing import Any

import bpy

from ....client import client
from ....properties.types import ObjectType
from ...models import FiberData, LEDData
from ...states import state
from ..property.animation_data import (
    set_ctrl_keyframes_from_state,
    set_pos_keyframes_from_state,
)

asset_path = bpy.context.preferences.filepaths.asset_libraries["User Library"].path
target_path = os.path.join(asset_path, "LightDance")


def set_bpy_props(obj: bpy.types.Object, **props: Any):
    for key, value in props.items():
        setattr(obj, key, value)


async def fetch_data(reload: bool = False):
    """
    Fetch assets from editor-server
    param reload: Fetch assets again even they already exist is true, otherwise only fetch missing assets.
    """
    print("fetching data")
    if client.http_client:
        async with client.http_client.get("/data/load.json") as response:
            assets_load = await response.json()
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
        """
        temp fetch control map
        """
        from ....api.control_agent import control_agent
        from ...utils.convert import control_map_query_to_state

        control_query = await control_agent.get_control_map_payload()
        if control_query is None:
            raise Exception("Control map not found")

        state.control_map = control_map_query_to_state(control_query)
    else:
        raise Exception("HTTP client is not initialized")
    return assets_load


def setup_assets(assets_load):
    """
    clear all objects
    """
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.object.select_all()
    bpy.ops.object.delete()
    """
    set dancer objects
    """
    dancer_array = state.dancers_array
    for dancer in dancer_array:
        dancer_name = dancer.name
        dancer_load = assets_load["DancerMap"][dancer_name]
        if dancer_name in bpy.context.scene.objects.keys():
            continue
        dancer_file = dancer_load["url"]
        dancer_filepath = os.path.normpath(target_path + dancer_file)
        dancer_parent = bpy.data.objects.new(dancer_name, None)
        dancer_parent.empty_display_size = 0
        setattr(dancer_parent, "ld_object_type", ObjectType.DANCER.value)
        bpy.context.scene.collection.objects.link(dancer_parent)
        bpy.ops.import_scene.gltf(
            filepath=dancer_filepath
        )  # here all parts of dancer is selected
        dancer_objects = bpy.context.selected_objects
        dancer_human = next(obj for obj in dancer_objects if obj.name[0:5] == "Human")
        set_bpy_props(
            dancer_human,
            name=f"{dancer.name}.Human",
            parent=dancer_parent,
            ld_object_type=ObjectType.HUMAN.value,
            color=(0, 0, 0, 1),
            data=bpy.data.meshes["human"],
        )
        for item in dancer.parts:
            part_objects = [i for i in dancer_objects if i.name.find(item.name) >= 0]
            if len(part_objects) == 0:
                print("Dancer part not found (maybe should reload asset)")
            if item.type.value == "LED":
                parts_parent = bpy.data.objects.new(
                    f"{dancer.name}.{item.name}.parent", None
                )
                bpy.context.scene.collection.objects.link(parts_parent)
                set_bpy_props(
                    parts_parent,
                    parent=dancer_parent,
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=item.type.value.lower(),
                    ld_part_name=item.name,
                    empty_display_size=0,
                )
                for i, obj in enumerate(part_objects):
                    obj.name = f"{dancer.name}.{item.name}.{i:03}"
                    set_bpy_props(
                        obj,
                        parent=parts_parent,
                        ld_object_type=ObjectType.LIGHT.value,
                        ld_light_type=item.type.value.lower(),
                        ld_part_name=item.name,
                        data=bpy.data.meshes["Sphere.001"],
                        ld_led_pos=i,
                    )
            elif item.type.value == "FIBER":
                obj = part_objects[0]
                obj.name = f"{dancer.name}.{item.name}"
                obj.parent = dancer_parent
                setattr(obj, "ld_object_type", "light")
                setattr(obj, "ld_light_type", item.type.value.lower())
                setattr(obj, "ld_part_name", item.name)
    bpy.ops.outliner.orphans_purge(do_recursive=True)


def set_music_from_load(assets_load):
    """
    set music
    """
    scene = bpy.context.scene
    if not scene.sequence_editor:
        scene.sequence_editor_create()
    music_filepath = os.path.normpath(target_path + assets_load["Music"])
    scene.sequence_editor.sequences.new_sound(
        "music", filepath=music_filepath, channel=1, frame_start=0
    )


def setup_viewport():
    """
    3d viewport
    """
    view_3d = next(a for a in bpy.context.screen.areas if a.ui_type == "VIEW_3D")
    setattr(view_3d.spaces.active.overlay, "show_relationship_lines", False)  # type: ignore
    setattr(view_3d.spaces.active.shading, "background_type", "VIEWPORT")  # type: ignore
    setattr(view_3d.spaces.active.shading, "background_color", (0, 0, 0))  # type: ignore
    setattr(view_3d.spaces.active.shading, "color_type", "OBJECT")  # type: ignore
    setattr(view_3d.spaces.active.shading, "light", "FLAT")  # type: ignore

    """
    timeline
    """
    bpy.context.scene.render.fps = 1000
    bpy.context.scene.frame_end = bpy.context.scene.sequence_editor.sequences[
        0
    ].frame_duration
    bpy.context.scene.show_keys_from_selected_only = False
    bpy.context.scene.sync_mode = "AUDIO_SYNC"
    timeline = next(a for a in bpy.context.screen.areas if a.ui_type == "TIMELINE")
    setattr(timeline.spaces.active, "show_seconds", True)  # type: ignore
    setattr(timeline.spaces.active.dopesheet, "filter_text", "ld")  # type: ignore


async def load_data() -> None:
    assets_load = await fetch_data()
    setup_assets(assets_load)
    set_music_from_load(assets_load)
    set_pos_keyframes_from_state()
    set_ctrl_keyframes_from_state()
    setup_viewport()
    print("data loaded")
