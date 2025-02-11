from typing import cast

import bpy

from ....config import config
from ....utils.convert import rgb_to_float


def setup_floor() -> None:
    if not bpy.context:
        return

    data_objects: dict[str, bpy.types.Object] = cast(
        dict[str, bpy.types.Object], bpy.data.objects
    )

    # Create floor
    stage_scale: float = cast(float, getattr(config, "stage_scale", 1.0))
    stage_width: float = cast(float, getattr(config, "stage_width", 1.0)) * stage_scale
    stage_length: float = (
        cast(float, getattr(config, "stage_length", 1.0)) * stage_scale
    )
    stage_stroke: float = 0.02
    stage_color: tuple[float, float, float, float] = cast(
        tuple[float, float, float, float], (*rgb_to_float((38, 123, 216)), 1.0)
    )

    edge_locations: list[tuple[float, float, float]] = [
        (0, stage_width / 2, 0),
        (0, -stage_width / 2, 0),
        (stage_length / 2, 0, 0),
        (-stage_length / 2, 0, 0),
    ]
    edge_scales: list[tuple[float, float, float]] = [
        (stage_length + stage_stroke, stage_stroke, stage_stroke),
        (stage_length + stage_stroke, stage_stroke, stage_stroke),
        (stage_stroke, stage_width + stage_stroke, stage_stroke),
        (stage_stroke, stage_width + stage_stroke, stage_stroke),
    ]

    for i in range(4):
        name = f"FloorEdge{i}"
        if name in data_objects:
            bpy.data.objects.remove(data_objects[name])

        bpy.ops.mesh.primitive_cube_add(size=1)
        edge_obj: bpy.types.Object | None = bpy.context.object
        if edge_obj is None:
            return

        edge_obj.name = name
        edge_obj.location = edge_locations[i]
        edge_obj.scale = edge_scales[i]
        edge_obj.color = stage_color
        edge_obj.hide_select = True

    for obj in cast(list[bpy.types.Object], bpy.context.view_layer.objects.selected):
        obj.select_set(False)

    # Floor Material setup
    material_wooden = bpy.data.materials.new(name="Wooden")
    material_wooden.use_nodes = True

    node_tree = material_wooden.node_tree
    if node_tree is None:
        return

    material_output = node_tree.nodes.get("Material Output")
    pri_bsdf = node_tree.nodes.get("Principled BSDF")

    if not material_output or not pri_bsdf:
        return

    material_output.location = (400, 500)
    pri_bsdf.location = (100, 500)

    # Create nodes
    brick_texture = node_tree.nodes.new("ShaderNodeTexBrick")
    map1 = node_tree.nodes.new("ShaderNodeMapping")
    coord1 = node_tree.nodes.new("ShaderNodeTexCoord")
    bump = node_tree.nodes.new("ShaderNodeBump")
    noise = node_tree.nodes.new("ShaderNodeTexNoise")
    map2 = node_tree.nodes.new("ShaderNodeMapping")
    coord2 = node_tree.nodes.new("ShaderNodeTexCoord")
    mix = node_tree.nodes.new("ShaderNodeMixRGB")
    ramp = node_tree.nodes.new("ShaderNodeValToRGB")

    # Set node locations (For manual adjustment)
    brick_texture.location = (-600, 300)
    map1.location = (-800, 300)
    coord1.location = (-1000, 300)
    bump.location = (-400, 200)
    noise.location = (-600, 750)
    map2.location = (-800, 750)
    coord2.location = (-1000, 750)
    mix.location = (-400, 500)
    ramp.location = (-200, 500)

    # Connect nodes
    node_tree.links.new(coord1.outputs[3], map1.inputs[0])
    node_tree.links.new(coord2.outputs[3], map2.inputs[0])
    node_tree.links.new(map1.outputs[0], brick_texture.inputs[0])
    node_tree.links.new(map2.outputs[0], noise.inputs[0])
    node_tree.links.new(brick_texture.outputs[0], mix.inputs[2])
    node_tree.links.new(noise.outputs[0], mix.inputs[1])
    node_tree.links.new(mix.outputs[0], ramp.inputs[0])
    node_tree.links.new(ramp.outputs[0], pri_bsdf.inputs[0])
    node_tree.links.new(bump.outputs[0], pri_bsdf.inputs[5])

    # Modify node values
    setattr(brick_texture.inputs[1], "default_value", (0.226, 0.226, 0.226, 1))
    setattr(brick_texture.inputs[2], "default_value", (0.413, 0.413, 0.413, 1))
    setattr(brick_texture.inputs[4], "default_value", 7.00)
    setattr(brick_texture.inputs[5], "default_value", 0.005)
    setattr(brick_texture.inputs[6], "default_value", 1.00)
    setattr(brick_texture.inputs[7], "default_value", 0.02)
    setattr(brick_texture.inputs[8], "default_value", 4.00)
    setattr(brick_texture.inputs[9], "default_value", 0.60)

    setattr(noise.inputs[2], "default_value", 6.00)
    setattr(noise.inputs[3], "default_value", 16.00)
    setattr(noise.inputs[4], "default_value", 0.80)
    setattr(noise.inputs[8], "default_value", 4.00)

    vec = list(getattr(map2.inputs[3], "default_value"))
    vec[1] = 10.00
    setattr(map2.inputs[3], "default_value", vec)

    setattr(mix.inputs[0], "default_value", 1.00)
    setattr(mix, "blend_type", "MULTIPLY")

    ramp.color_ramp.elements.new(0.200)  # type: ignore
    ramp.color_ramp.elements.new(0.500)  # type: ignore
    setattr(ramp.color_ramp.elements[3], "position", 0.450)  # type: ignore
    setattr(ramp.color_ramp.elements[2], "position", 0.250)  # type: ignore
    setattr(ramp.color_ramp.elements[1], "position", 0.100)  # type: ignore
    setattr(ramp.color_ramp.elements[3], "color", (1.00, 0.89, 0.81, 1.00))  # type: ignore
    setattr(ramp.color_ramp.elements[2], "color", (0.90, 0.65, 0.47, 1.00))  # type: ignore
    setattr(ramp.color_ramp.elements[1], "color", (0.42, 0.27, 0.18, 1.00))  # type: ignore

    setattr(pri_bsdf.inputs[2], "default_value", 0.240)

    flr = "wooden_floor"

    # Remove existing floor
    if flr in bpy.data.objects:
        obj = bpy.data.objects.get(flr)
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Add new floor
    bpy.ops.mesh.primitive_cube_add(
        scale=(stage_width / 2, stage_length / 2, 0.01),
        location=(0,0,-0.03)
    )
    
    obj = bpy.context.object
    if obj:
        obj.rotation_euler.z = 1.5708
        obj.name = flr
        obj.color = (0.00315199, 0.00315199, 0.00315199, 1)
        obj.active_material = material_wooden
        obj.hide_select = True
