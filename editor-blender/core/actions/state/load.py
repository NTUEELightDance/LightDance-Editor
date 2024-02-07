import os
from typing import Any, Dict, List, Set, cast

import bpy

from ....client import client
from ....properties.types import LightType, ObjectType
from ...actions.property.revision import update_rev_changes
from ...models import DancersArrayPartsItem, PartType
from ...states import state
from ...utils.ui import set_dopesheet_filter
from ..property.animation_data import (
    set_ctrl_keyframes_from_state,
    set_pos_keyframes_from_state,
)
from .waveform import enable_waveform

asset_path = cast(
    str, bpy.context.preferences.filepaths.asset_libraries["User Library"].path
)
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
        assets_load: Dict[str, Any] = await client.download_json("/data/load.json")

        try:
            url_set: Set[str] = set()
            for tag in ["Waveform", "Music", "LightPresets", "PosPresets"]:
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


def import_model_to_asset(
    model_name: str, model_filepath: str, parts: List[DancersArrayPartsItem]
):
    """
    set dancer collection asset
    """
    bpy.ops.import_scene.gltf(
        filepath=model_filepath
    )  # here all parts of dancer is selected
    model_objs = bpy.context.selected_objects

    col = bpy.data.collections.new(model_name)
    for obj in model_objs:
        for old_col in obj.users_collection:
            old_col.objects.unlink(obj)
        col.objects.link(obj)

        # avoid part name conflict
        obj.name = f"{model_name}.{obj.name}"

    # Clean meshes
    sphere_mesh = find_first_mesh("Sphere")
    sphere_mesh.name = f"{model_name}.Sphere"

    for obj in model_objs:
        if obj.type == "EMPTY":
            continue
        if "Sphere" in obj.data.name and obj.data != sphere_mesh:
            bpy.data.meshes.remove(cast(bpy.types.Mesh, obj.data), do_unlink=True)
            obj.data = sphere_mesh

    human_mesh = find_first_mesh("human")
    human_mesh.name = f"{model_name}.Human"

    for obj in model_objs:
        if obj.type == "EMPTY":
            continue
        mesh = obj.data
        if "BezierCurve" in mesh.name and model_name not in mesh.name:
            mesh.name = f"{model_name}.{mesh.name}"

    col.asset_mark()
    for part in parts:
        part_objects = [
            part_obj for part_obj in model_objs if part_obj.name.find(part.name) >= 0
        ]
        if len(part_objects) == 0:
            print("Dancer part not found (maybe should reload asset)")

    bpy.ops.outliner.orphans_purge(do_recursive=True)
    print(f"Model: {model_name} imported")


def find_first_mesh(mesh_name: str) -> bpy.types.Mesh:
    data_meshes = cast(Dict[str, bpy.types.Mesh], bpy.data.meshes)
    mesh = data_meshes.get(mesh_name)

    if mesh is None:
        candidates = [name for name in data_meshes.keys() if name.find(mesh_name) == 0]
        numbers = [int(name.split(".")[-1]) for name in candidates]
        mesh = data_meshes[candidates[numbers.index(min(numbers))]]

    return mesh


def setup_objects(assets_load: Dict[str, Any]):
    """
    clear all objects in viewport
    """
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    for old_obj in data_objects.values():
        if old_obj.visible_get() and not hasattr(old_obj, "ld_dancer_name"):
            bpy.data.objects.remove(old_obj)

    """
    set dancer objects
    """
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    if check_local_object_list():
        print("local objects detected")
        return
    else:
        for old_obj in data_objects.values():
            if old_obj.visible_get():
                bpy.data.objects.remove(old_obj)

    dancer_array = state.dancers_array
    for dancer in dancer_array:
        dancer_name = dancer.name
        dancer_index = dancer_name.split("_")[0]
        dancer_load = assets_load["DancerMap"][dancer_name]
        if dancer_name in bpy.context.scene.objects.keys():
            continue

        model_file: str = dancer_load["url"]
        model_filepath = os.path.normpath(target_path + model_file)
        model_name: str = dancer_load["modelName"]

        if model_name not in bpy.data.collections.keys():
            import_model_to_asset(model_name, model_filepath, dancer.parts)

        data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)
        dancer_asset = cast(bpy.types.Collection, bpy.data.collections[model_name])

        dancer_asset_objects_dict = {
            obj.name: cast(bpy.types.Object, obj.copy())
            for obj in cast(List[bpy.types.Object], dancer_asset.all_objects)
        }

        for name, obj in dancer_asset_objects_dict.items():
            pure_name = ".".join(name.split(".")[1:])
            new_name = f"{dancer_index}_{pure_name}"
            if pure_name == model_name:
                new_name = dancer_name
            obj.name = new_name

        dancer_asset_objects = {
            obj.name: obj
            for obj in cast(List[bpy.types.Object], dancer_asset_objects_dict.values())
        }

        # for name, obj in dancer_asset_objects.items():
        #     print(name, obj)
        # break

        # dancer_parent = bpy.data.objects.new(dancer_name, None)
        dancer_obj = dancer_asset_objects[dancer_name]
        set_bpy_props(
            dancer_obj,
            empty_display_size=0,
            ld_dancer_name=dancer.name,
            ld_model_name=model_name,
            ld_object_type=ObjectType.DANCER.value,
        )
        bpy.context.scene.collection.objects.link(dancer_obj)

        human_name = f"{dancer_index}_Human"
        human_obj = dancer_asset_objects[human_name]
        set_bpy_props(
            human_obj,
            parent=dancer_obj,
            color=(0, 0, 0, 1),
            ld_object_type=ObjectType.HUMAN.value,
            ld_dancer_name=dancer.name,
            ld_model_name=model_name,
        )
        bpy.context.scene.collection.objects.link(human_obj)

        for part_item in dancer.parts:
            part_obj_name = f"{dancer_index}_{part_item.name}"
            part_obj = dancer_asset_objects.get(part_obj_name)

            if part_obj is None:
                print("Dancer part not found (maybe should reload asset)")
                continue

            if part_item.type.value == "LED":
                set_bpy_props(
                    part_obj,
                    parent=dancer_obj,
                    empty_display_size=0,
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.LED.value,
                    ld_part_name=part_item.name,
                    ld_dancer_name=dancer.name,
                    ld_model_name=model_name,
                )
                bpy.context.scene.collection.objects.link(part_obj)

                led_objs = [
                    obj
                    for obj_name, obj in dancer_asset_objects.items()
                    if f"{part_obj_name}." in obj_name
                ]
                for led_obj in led_objs:
                    position = int(led_obj.name.split(".")[-1])
                    set_bpy_props(
                        led_obj,
                        parent=part_obj,
                        color=(0, 0, 0, 1),
                        ld_object_type=ObjectType.LIGHT.value,
                        ld_light_type=LightType.LED_BULB.value,
                        ld_part_name=part_item.name,
                        ld_dancer_name=dancer.name,
                        ld_model_name=model_name,
                        ld_led_pos=position,
                    )
                    bpy.context.scene.collection.objects.link(led_obj)

            elif part_item.type.value == "FIBER":
                set_bpy_props(
                    part_obj,
                    parent=dancer_obj,
                    name=part_obj_name,
                    color=(0, 0, 0, 1),
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.FIBER.value,
                    ld_part_name=part_item.name,
                    ld_dancer_name=dancer.name,
                    ld_model_name=model_name,
                )
                bpy.context.scene.collection.objects.link(part_obj)


def setup_music(assets_load: Dict[str, Any]):
    """
    set music
    """
    scene = bpy.context.scene
    if not scene.sequence_editor:
        scene.sequence_editor_create()
    music_filepath = os.path.normpath(target_path + assets_load["Music"])
    if scene.sequence_editor.sequences:
        sequence = cast(bpy.types.SoundSequence, scene.sequence_editor.sequences[0])
        scene.sequence_editor.sequences.remove(sequence)

    scene.sequence_editor.sequences.new_sound(
        "music", filepath=music_filepath, channel=1, frame_start=0
    )


def setup_wavefrom(assets_load: Dict[str, Any]):
    """
    set waveform
    """
    waveform_filepath = os.path.normpath(target_path + assets_load["Waveform"])
    print(waveform_filepath)
    enable_waveform(waveform_filepath)
    print("Waveform loaded")


def setup_viewport():
    """
    3d viewport
    """
    view_3d = next(
        area
        for area in cast(List[bpy.types.Area], bpy.context.screen.areas)
        if area.ui_type == "VIEW_3D"
    )

    space = cast(bpy.types.SpaceView3D, view_3d.spaces.active)
    space.overlay.show_relationship_lines = False
    space.shading.background_type = "VIEWPORT"
    space.shading.background_color = (0, 0, 0)
    space.shading.color_type = "OBJECT"
    space.shading.light = "FLAT"

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
    timeline = next(
        area
        for area in cast(List[bpy.types.Area], bpy.context.screen.areas)
        if area.ui_type == "TIMELINE"
    )

    space = cast(bpy.types.SpaceSequenceEditor, timeline.spaces.active)
    space.show_seconds = True

    set_dopesheet_filter("control_frame")  # follow default editor


def setup_animation_data():
    if not getattr(bpy.context.scene, "ld_anidata"):
        set_pos_keyframes_from_state()
        set_ctrl_keyframes_from_state()
        setattr(bpy.context.scene, "ld_anidata", True)
    else:
        print("local animation data detected")
        # update_rev_changes(state.pos_map, state.control_map)  # TODO: test this


def check_local_object_list():
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_item in state.dancers_array:
        dancer_name = dancer_item.name
        if dancer_name not in bpy.data.objects.keys():
            return False

        dancer_parts = dancer_item.parts
        dancer_index = dancer_name.split("_")[0]
        for part_item in dancer_parts:
            part_name = part_item.name
            part_type = part_item.type
            part_obj_name = f"{dancer_index}_{part_name}"

            match part_type:
                case PartType.LED:
                    part_parent = data_objects.get(part_obj_name)
                    if part_parent is None:
                        return False

                    if len(part_parent.children) != part_item.length:
                        return False

                case PartType.FIBER:
                    if part_obj_name not in data_objects.keys():
                        return False

    return True


async def load_data() -> None:
    assets_load = await fetch_data()

    setup_objects(assets_load)
    setup_music(assets_load)
    setup_animation_data()
    setup_viewport()

    setup_wavefrom(assets_load)

    print("Data loaded")
