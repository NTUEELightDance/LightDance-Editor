import os
from typing import Any

import bpy

from ....client import client
from ....properties.types import ObjectType
from ...models import FiberData, LEDData
from ...states import state

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
        state.control_map = control_map_query_to_state(control_query)
    else:
        raise Exception("HTTP client is not initialized")
    return assets_load


def setup_assets(assets_load):
    """
    clear all objects
    """
    # bpy.ops.object.select_all(action='DESELECT')
    # bpy.ops.object.select_all()
    # bpy.ops.object.delete()
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
        bpy.context.object.empty_display_size = 0
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
                )
                bpy.context.object.empty_display_size = 0
                for obj in part_objects:
                    obj.name = f"{dancer.name}.{item.name}"
                    set_bpy_props(
                        obj,
                        parent=parts_parent,
                        ld_object_type=ObjectType.LIGHT.value,
                        ld_light_type=item.type.value.lower(),
                        ld_part_name=item.name,
                    )
            elif item.type.value == "FIBER":
                obj = part_objects[0]
                obj.name = f"{dancer.name}.{item.name}"
                obj.parent = dancer_parent
                setattr(obj, "ld_object_type", "light")
                setattr(obj, "ld_light_type", item.type.value.lower())
                setattr(obj, "ld_part_name", item.name)

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

    """
    set position keyframes
    """
    # pos_map = state.pos_map
    from .fake_pos_map import pos_map

    for id, pos_map_element in pos_map.items():
        frame_start = pos_map_element["start"]  # type: ignore
        pos_status = pos_map_element["pos"]  # type: ignore
        for dancer_name, pos in pos_status.items():
            dancer_obj = bpy.data.objects[dancer_name]
            dancer_obj.location = (pos["x"], pos["y"], pos["z"])
            dancer_obj.keyframe_insert(data_path="location", frame=frame_start)

    ctrl_map = state.control_map
    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    print(led_effect_table)
    for id, ctrl_map_element in ctrl_map.items():
        frame_start = ctrl_map_element.start
        fade = ctrl_map_element.fade
        ctrl_status = ctrl_map_element.status
        for dancer_name, ctrl in ctrl_status.items():
            for part_name, part_data in ctrl.items():
                if isinstance(part_data, LEDData):
                    part_parent = bpy.data.objects[f"{dancer_name}.{part_name}.parent"]
                    # part_effect = led_effect_table[part_data.effect_id]
                    # part_effect_frames = part_effect.effects
                    # for effect_frame in part_effect_frames:
                    #     effect_frame_start = frame_start + effect_frame.start
                    #     effect_list = effect_frame.effect
                    #     effect_fade = effect_frame.fade
                    #     for i in range(len(part_parent.children)):
                    #         led_obj = part_parent.children[i]
                    #         led_data = effect_list[i]
                    #         led_rgb = color_map[led_data.color_id].rgb
                    #         led_rgba = (
                    #             led_rgb[0]/255,
                    #             led_rgb[1]/255,
                    #             led_rgb[2]/255,
                    #             led_data.alpha/10
                    #         )
                    #         set_bpy_props(led_obj, color=led_rgba)
                    #         led_obj.keyframe_insert(data_path="color", frame=effect_frame_start)
                    #         for fcurve in led_obj.animation_data.action.fcurves:
                    #             kf = fcurve.keyframe_points[-1]
                    #             kf.interpolation = 'LINEAR' if effect_fade else 'CONSTANT'

                elif isinstance(part_data, FiberData):
                    part_obj = bpy.data.objects[f"{dancer_name}.{part_name}"]
                    part_rgb = color_map[part_data.color_id].rgb
                    part_rgba = (
                        part_rgb[0] / 255,
                        part_rgb[1] / 255,
                        part_rgb[2] / 255,
                        part_data.alpha / 10,
                    )
                    set_bpy_props(part_obj, color=part_rgba)
                    part_obj.keyframe_insert(data_path="color", frame=frame_start)
                    for fcurve in part_obj.animation_data.action.fcurves:
                        kf = fcurve.keyframe_points[-1]
                        kf.interpolation = "LINEAR" if fade else "CONSTANT"
                else:
                    print("Invalid part data")

    # TODO: refactor, set all props in one loop?


def setup_viewport():
    """
    3d viewport
    """
    view_3d = next(a for a in bpy.context.screen.areas if a.type == "VIEW_3D")
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
    bpy.context.scene.sync_mode = "AUDIO_SYNC"


async def load_data() -> None:
    assets_load = await fetch_data()
    try:
        setup_assets(assets_load)
    except Exception as e:
        print(e)
    setup_viewport()
    print("data loaded")
