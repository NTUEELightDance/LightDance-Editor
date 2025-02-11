import asyncio
import os
from typing import cast

import bpy

from .....properties.types import DancerModelHashItemType, LightType, ObjectType
from ....config import config
from ....log import logger
from ....models import DancersArrayPartsItem, ModelName, PartType
from ....states import state
from ....utils.object import set_bpy_props


def check_local_object_list():
    if not bpy.context:
        return
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)
    dancer_objects_exist = {}
    dancer_model_update = state.init_temps.dancer_model_update

    dancer_models_hash = state.init_temps.dancer_models_hash

    # local_dancer_models_hash_list = cast(
    local_dancer_models_hash = cast(
        list[DancerModelHashItemType],
        getattr(bpy.context.scene, "ld_dancer_model_hash"),
    )

    # Do NOT skip unselected dancers here
    for dancer_item in state.dancers_array:
        dancer_name = dancer_item.name
        dancer_objects_exist[dancer_name] = True

        if dancer_name not in bpy.data.objects.keys():
            dancer_objects_exist[dancer_name] = False
            continue

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
                        dancer_objects_exist[dancer_name] = False
                        break

                    if len(part_parent.children) != part_item.length:
                        dancer_objects_exist[dancer_name] = False
                        break

                case PartType.FIBER:
                    if part_obj_name not in data_objects.keys():
                        dancer_objects_exist[dancer_name] = False
                        break

        local_dancer_model_hash = None
        for i, model_hash in enumerate(local_dancer_models_hash):
            if model_hash.dancer_name == dancer_name:
                local_dancer_model_hash = (i, model_hash)
                break

        if local_dancer_model_hash is None or local_dancer_model_hash[
            1
        ].model_hash != dancer_models_hash.get(dancer_name, ""):
            logger.warning(f"Model hash mismatch for {dancer_name}")
            dancer_model_update[dancer_name] = True
            if local_dancer_model_hash is not None:
                getattr(bpy.context.scene, "ld_dancer_model_hash").remove(
                    local_dancer_model_hash[0]
                )

        # Model should be updated, remove dancer first
        if not dancer_objects_exist[dancer_name]:
            dancer_obj = data_objects[dancer_name]
            recursive_remove_object(dancer_obj)

    state.init_temps.dancers_object_exist = dancer_objects_exist


async def import_model_to_asset(
    model_name: str, model_filepath: str, parts: list[DancersArrayPartsItem]
):
    """
    set dancer collection asset
    """
    bpy.ops.import_scene.gltf(
        filepath=model_filepath
    )  # here all parts of dancer is selected
    while True:
        model_objs = getattr(bpy.context, "selected_objects", None)
        if model_objs is None:
            await asyncio.sleep(0.1)
        else:
            break

    model_objs = cast(list[bpy.types.Object], model_objs)

    col = bpy.data.collections.new(model_name)
    for obj in model_objs:
        for old_col in obj.users_collection:
            old_col.objects.unlink(obj)
        col.objects.link(obj)

        # avoid part name conflict
        obj.name = f"{model_name}.{obj.name}"

        # Add material to each object
        material = bpy.data.materials.new(name=f"{obj.name}_Material")
        material.use_nodes = True

        # Ensure the object has valid data
        if obj.data is not None and hasattr(obj.data, "materials"):
            # Create new nodes and some setup
            bsdf_node = material.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")  # type: ignore
            object_node = material.node_tree.nodes.new(type="ShaderNodeObjectInfo")  # type: ignore

            material.node_tree.links.new(object_node.outputs[1], bsdf_node.inputs[0])  # type: ignore
            material.node_tree.links.new(object_node.outputs[1], bsdf_node.inputs[26])  # type: ignore
            setattr(bsdf_node.inputs[27], "default_value", 5.0)

            # Material Output node if it doesn't exist
            material_output_node = material.node_tree.nodes.get("Material Output")  # type: ignore
            if not material_output_node:
                material_output_node = material.node_tree.nodes.new(type="ShaderNodeOutputMaterial")  # type: ignore

            material.node_tree.links.new(bsdf_node.outputs[0], material_output_node.inputs["Surface"])  # type: ignore

            # Assign material to the object
            if obj.data.materials:  # type: ignore
                obj.data.materials[0] = material  # type: ignore
            else:
                obj.data.materials.append(material)  # type: ignore

    # Clean meshes
    sphere_mesh = find_first_mesh("Sphere")
    if sphere_mesh is not None:
        sphere_mesh.name = f"{model_name}.Sphere"

        for obj in model_objs:
            if obj.type == "EMPTY" or not obj.data:
                continue
            if "Sphere" in obj.data.name and obj.data != sphere_mesh:
                old_mesh = cast(bpy.types.Mesh, obj.data)
                obj.data = sphere_mesh
                bpy.data.meshes.remove(old_mesh, do_unlink=True)

    human_mesh = find_first_mesh("human")
    if human_mesh is not None:
        human_mesh.name = f"{model_name}.Human"

    for obj in model_objs:
        if obj.type == "EMPTY" or not obj.data:
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
            logger.warning("Dancer part not found (maybe should reload asset)")

    bpy.ops.outliner.orphans_purge(do_recursive=True)
    logger.info(f"Model: {model_name} imported")


def find_first_mesh(mesh_name: str) -> bpy.types.Mesh | None:
    data_meshes = cast(dict[str, bpy.types.Mesh], bpy.data.meshes)
    mesh = data_meshes.get(mesh_name)

    if mesh is None:
        candidates = [name for name in data_meshes.keys() if name.find(mesh_name) == 0]
        if len(candidates) == 0:
            return None

        numbers = [int(name.split(".")[-1]) for name in candidates]
        mesh = data_meshes[candidates[numbers.index(min(numbers))]]

    return mesh


def setup_dancer_part_objects_map():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    show_dancer = state.show_dancers

    dancer_array = state.dancers_array
    for dancer in dancer_array:
        dancer_name = dancer.name
        dancer_index = state.dancer_part_index_map[dancer_name].index

        if not show_dancer[dancer_index]:
            continue

        dancer_obj = data_objects[dancer_name]
        state.dancer_part_objects_map[dancer_name] = (dancer_obj, {})

        for part_item in dancer.parts:
            part_name = part_item.name
            part_obj_name = f"{dancer_index}_{part_name}"
            part_obj = data_objects[part_obj_name]

            state.dancer_part_objects_map[dancer_name][1][part_name] = part_obj


def recursive_remove_object(obj: bpy.types.Object):
    for child in obj.children:
        recursive_remove_object(child)

    bpy.data.objects.remove(obj)


async def setup_objects():
    if not bpy.context:
        return
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    """
    clear all objects in viewport
    """
    for old_obj in data_objects.values():
        if old_obj.visible_get() and not hasattr(old_obj, "ld_dancer_name"):
            bpy.data.objects.remove(old_obj)

    """
    set dancer objects
    """
    assets_load = state.init_temps.assets_load
    dancers_model_update = state.init_temps.dancer_model_update
    dancer_reset_animation = state.init_temps.dancers_reset_animation

    dancer_reset_animation.extend([True] * len(state.dancers_array))

    check_local_object_list()
    dancers_object_exist = state.init_temps.dancers_object_exist

    # New file
    if not any(dancers_object_exist.values()):
        for old_obj in data_objects.values():
            if old_obj.visible_get():
                bpy.data.objects.remove(old_obj)

    models_ready: dict[ModelName, bool] = {}

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))

    dancer_array = state.dancers_array
    for dancer_index, dancer in enumerate(dancer_array):
        dancer_name = dancer.name
        dancer_object_exist = dancers_object_exist[dancer_name]
        dancer_model_update = dancers_model_update[dancer_name]

        if not show_dancer_dict[dancer.name]:
            if dancer_object_exist:
                dancer_obj = data_objects[dancer_name]
                recursive_remove_object(dancer_obj)
            continue

        # Dancer object exists and model doesn't need to be updated
        if dancer_object_exist and not dancer_model_update:
            state.init_temps.dancers_reset_animation[dancer_index] = False
            continue

        logger.info(f"Setting up dancer {dancer.name}...")
        dancer_load = assets_load["DancerMap"][dancer_name]

        # Remove existing dancer object if model needs to be updated
        if dancer_object_exist:
            dancer_obj = data_objects[dancer_name]
            recursive_remove_object(dancer_obj)

        model_file: str = dancer_load["url"]
        model_filepath = os.path.normpath(config.ASSET_PATH + model_file)
        model_name: str = dancer_load["modelName"]

        # Remove model in collections if model needs to be updated
        if (
            dancer_model_update
            and not models_ready.get(model_name, False)
            and model_name in bpy.data.collections.keys()
        ):
            collection = cast(bpy.types.Collection, bpy.data.collections[model_name])
            all_objects = cast(list[bpy.types.Object], collection.all_objects)
            collection_objects = [obj for obj in all_objects]

            bpy.data.collections.remove(collection)
            for obj in collection_objects:
                bpy.data.objects.remove(obj)

        if model_name not in bpy.data.collections.keys():
            await import_model_to_asset(model_name, model_filepath, dancer.parts)

        models_ready[model_name] = True

        data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)
        dancer_asset = cast(bpy.types.Collection, bpy.data.collections[model_name])
        dancer_asset_objects = {
            cast(str, obj.name): obj
            for obj in cast(list[bpy.types.Object], dancer_asset.all_objects)
        }

        asset_dancer_obj = dancer_asset_objects.get(f"{model_name}.{model_name}")
        if asset_dancer_obj is None:
            logger.warning(f"Dancer {dancer_name} not found in asset")
            continue

        dancer_obj = cast(bpy.types.Object, asset_dancer_obj.copy())
        set_bpy_props(
            dancer_obj,
            name=dancer_name,
            empty_display_size=0,
            ld_dancer_name=dancer.name,
            ld_model_name=model_name,
            ld_object_type=ObjectType.DANCER.value,
        )
        bpy.context.scene.collection.objects.link(dancer_obj)

        asset_human_obj = dancer_asset_objects.get(f"{model_name}.Human")
        if asset_human_obj is None:
            logger.warning(f"Human not found in dancer {dancer_name}")
            continue

        human_obj = cast(bpy.types.Object, asset_human_obj.copy())
        set_bpy_props(
            human_obj,
            name=f"{dancer_index}_Human",
            parent=dancer_obj,
            color=(0, 0, 0, 1),
            ld_object_type=ObjectType.HUMAN.value,
            ld_dancer_name=dancer.name,
            ld_model_name=model_name,
        )
        bpy.context.scene.collection.objects.link(human_obj)

        for part_item in dancer.parts:
            asset_part_obj_name = f"{model_name}.{part_item.name}"
            asset_part_obj = dancer_asset_objects.get(asset_part_obj_name)
            if asset_part_obj is None:
                logger.warning(
                    f"Object {asset_part_obj_name} not found in dancer {dancer_name}"
                )
                continue

            part_obj = cast(bpy.types.Object, asset_part_obj.copy())
            part_obj_name = f"{dancer_index}_{part_item.name}"

            if part_item.type.value == "LED":
                set_bpy_props(
                    part_obj,
                    name=part_obj_name,
                    parent=dancer_obj,
                    empty_display_size=0,
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.LED.value,
                    ld_part_name=part_item.name,
                    ld_dancer_name=dancer.name,
                    ld_model_name=model_name,
                )
                bpy.context.scene.collection.objects.link(part_obj)

                length = part_item.length
                if length is None:
                    logger.warning(
                        f"LED part {part_item.name} length not found in dancer {dancer_name}"
                    )
                    continue

                for position in range(length):
                    asset_sub_obj_name = f"{asset_part_obj_name}.{position:03}"
                    asset_led_obj = dancer_asset_objects.get(asset_sub_obj_name)
                    if asset_led_obj is None:
                        logger.warning(
                            f"LED part {part_item.name} position {position} not found in dancer {dancer_name}"
                        )
                        continue

                    led_obj = cast(bpy.types.Object, asset_led_obj.copy())
                    sub_obj_name = f"{part_obj_name}.{position:03}"

                    set_bpy_props(
                        led_obj,
                        name=sub_obj_name,
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
                    name=part_obj_name,
                    parent=dancer_obj,
                    color=(0, 0, 0, 1),
                    ld_object_type=ObjectType.LIGHT.value,
                    ld_light_type=LightType.FIBER.value,
                    ld_part_name=part_item.name,
                    ld_dancer_name=dancer.name,
                    ld_model_name=model_name,
                )
                bpy.context.scene.collection.objects.link(part_obj)

        # Add model hash to blender if dancer is successfully loaded
        new_dancer_models_hash = cast(
            DancerModelHashItemType,
            getattr(bpy.context.scene, "ld_dancer_model_hash").add(),
        )
        new_dancer_models_hash.dancer_name = dancer_name
        new_dancer_models_hash.model_hash = state.init_temps.dancer_models_hash[
            dancer_name
        ]

    setup_dancer_part_objects_map()
