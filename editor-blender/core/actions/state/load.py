import os
from typing import Any

import bpy

from ....client import client
from ....properties.types import LightType, ObjectType
from ...actions.property.revision import update_rev_changes
from ...models import PartType
from ...states import state
from ...utils.ui import set_dopesheet_filter
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
    use_draco = False
    if client.file_client:
        assets_load = await client.download_json("/data/load.json")
        try:
            url_set = set()
            for tag in ["Music", "LightPresets", "PosPresets"]:
                url_set.add(assets_load[tag])
            for key in assets_load["DancerMap"]:
                raw_url = assets_load["DancerMap"][key]["url"]
                if use_draco:
                    model_url = raw_url
                else:
                    model_url = "".join(raw_url.split(".draco"))
                    assets_load["DancerMap"][key]["url"] = model_url
                url_set.add(model_url)
            for url in url_set:
                file_path = os.path.normpath(target_path + url)
                file_dir = os.path.dirname(file_path)
                if os.path.isfile(file_path) and not reload:
                    continue
                if not os.path.exists(file_dir):
                    os.makedirs(file_dir)
                    print("created folder: ", file_dir)
                data = await client.download_binary(url)
                print("fetched file ", url, "from server")
                with open(file_path, "w+b") as file:
                    file.write(data)
        except Exception as e:
            print(e)
    else:
        raise Exception("File client is not initialized")
    return assets_load


def import_model_to_asset(model_name, model_filepath, parts):
    """
    set dancer collection asset
    """
    bpy.ops.import_scene.gltf(
        filepath=model_filepath
    )  # here all parts of dancer is selected
    model_parts = bpy.context.selected_objects
    col = bpy.data.collections.new(model_name)
    for obj in model_parts:
        for old_col in obj.users_collection:
            old_col.objects.unlink(obj)
        col.objects.link(obj)
    col.asset_mark()
    for item in parts:
        part_objects = [i for i in model_parts if i.name.find(item.name) >= 0]
        if len(part_objects) == 0:
            print("Dancer part not found (maybe should reload asset)")
        if item.type.value == "LED":
            for _, obj in enumerate(part_objects):
                set_bpy_props(obj, data=bpy.data.meshes["Sphere.001"])  # type: ignore
    bpy.ops.outliner.orphans_purge(do_recursive=True)
    print(f"model {model_name} imported")


def setup_objects(assets_load):
    """
    clear all objects in viewport
    """
    for old_obj in bpy.data.objects:
        if old_obj.visible_get() and not getattr(old_obj, "ld_dancer_name"):
            bpy.data.objects.remove(old_obj)
    """
    set dancer objects
    """
    if check_local_object_list():
        print("local objects detected")
        return
    else:
        for old_obj in bpy.data.objects:
            if old_obj.visible_get():
                bpy.data.objects.remove(old_obj)

    dancer_array = state.dancers_array
    for dancer in dancer_array:
        dancer_name = dancer.name
        dancer_index = dancer_name.split("_")[0]
        dancer_load = assets_load["DancerMap"][dancer_name]
        if dancer_name in bpy.context.scene.objects.keys():
            continue
        model_file = dancer_load["url"]
        model_filepath = os.path.normpath(target_path + model_file)
        model_name = dancer_load["modelName"]
        dancer_parent = bpy.data.objects.new(dancer_name, None)
        set_bpy_props(
            dancer_parent,
            ld_dancer_name=dancer.name,
            empty_display_size=0,
        )
        dancer_parent.empty_display_size = 0
        setattr(dancer_parent, "ld_object_type", ObjectType.DANCER.value)
        bpy.context.scene.collection.objects.link(dancer_parent)
        if model_name not in bpy.data.collections.keys():
            import_model_to_asset(model_name, model_filepath, dancer.parts)
        dancer_asset = bpy.data.collections[model_name]
        dancer_objects = [obj.copy() for obj in dancer_asset.all_objects]
        dancer_human = next(obj for obj in dancer_objects if obj.name[0:5] == "Human")
        bpy.context.scene.collection.objects.link(dancer_human)  # type: ignore
        set_bpy_props(
            dancer_human,  # type: ignore
            name=f"{dancer_index}.Human",
            parent=dancer_parent,
            ld_object_type=ObjectType.HUMAN.value,
            color=(0, 0, 0, 1),
            data=bpy.data.meshes["human"],
            ld_dancer_name=dancer.name,
        )
        for item in dancer.parts:
            part_objects = [i for i in dancer_objects if i.name.find(item.name) >= 0]
            if len(part_objects) == 0:
                print("Dancer part not found (maybe should reload asset)")
            if item.type.value == "LED":
                parts_parent = bpy.data.objects.new(
                    f"{dancer_index}.{item.name}.parent", None
                )
                bpy.context.scene.collection.objects.link(parts_parent)
                set_bpy_props(
                    parts_parent,
                    parent=dancer_parent,
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.LED.value,
                    ld_part_name=item.name,
                    empty_display_size=0,
                    ld_dancer_name=dancer.name,
                )
                for i, obj in enumerate(part_objects):
                    bpy.context.scene.collection.objects.link(obj)  # type: ignore
                    # obj.name = f"{dancer_index}.{item.name}.{i:03}"
                    set_bpy_props(
                        obj,  # type: ignore
                        name=f"{dancer_index}.{item.name}.{i:03}",
                        parent=parts_parent,
                        ld_object_type=ObjectType.LIGHT.value,
                        ld_light_type=LightType.LED_BULB.value,
                        ld_part_name=item.name,
                        data=bpy.data.meshes["Sphere.001"],
                        ld_led_pos=i,
                        ld_dancer_name=dancer.name,
                    )
            elif item.type.value == "FIBER":
                obj = part_objects[0]
                bpy.context.scene.collection.objects.link(obj)  # type: ignore
                set_bpy_props(
                    obj,  # type: ignore
                    name=f"{dancer_index}.{item.name}",
                    parent=dancer_parent,
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.FIBER.value,
                    ld_part_name=item.name,
                    ld_dancer_name=dancer.name,
                )


def setup_music(assets_load):
    """
    set music
    """
    scene = bpy.context.scene
    if not scene.sequence_editor:
        scene.sequence_editor_create()
    music_filepath = os.path.normpath(target_path + assets_load["Music"])
    if scene.sequence_editor.sequences:
        scene.sequence_editor.sequences.remove(scene.sequence_editor.sequences[0])
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
    bpy.context.scene.frame_start = 0
    bpy.context.scene.frame_end = bpy.context.scene.sequence_editor.sequences[
        0
    ].frame_duration
    bpy.context.scene.show_keys_from_selected_only = False
    bpy.context.scene.sync_mode = "AUDIO_SYNC"
    timeline = next(a for a in bpy.context.screen.areas if a.ui_type == "TIMELINE")
    setattr(timeline.spaces.active, "show_seconds", True)  # type: ignore
    set_dopesheet_filter("control_frame")  # follow default editor


def setup_animation_data():
    if not getattr(bpy.context.scene, "ld_anidata"):
        set_pos_keyframes_from_state()
        set_ctrl_keyframes_from_state()
        setattr(bpy.context.scene, "ld_anidata", True)
    else:
        print("local animation data detected")
        update_rev_changes(state.pos_map, state.control_map)  # TODO: test this


def check_local_object_list():
    for dancer_item in state.dancers_array:
        dancer_name = dancer_item.name
        if dancer_name not in bpy.data.objects.keys():
            return False
        dancer_parts = dancer_item.parts
        dancer_index = dancer_name.split("_")[0]
        for part_item in dancer_parts:
            part_name = part_item.name
            part_type = part_item.type
            match part_type:
                case PartType.LED:
                    if (
                        f"{dancer_index}.{part_name}.parent"
                        not in bpy.data.objects.keys()
                    ):
                        return False
                    part_parent = bpy.data.objects[f"{dancer_index}.{part_name}.parent"]

                    if len(part_parent.children) != part_item.length:
                        return False
                case PartType.FIBER:
                    if f"{dancer_index}.{part_name}" not in bpy.data.objects.keys():
                        return False
                case _:
                    return False
    return True


async def load_data() -> None:
    assets_load = await fetch_data()
    setup_objects(assets_load)
    setup_music(assets_load)
    setup_animation_data()
    setup_viewport()
    print("data loaded")
