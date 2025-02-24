"""
Usage:
    Open this script from Blender text editor and run it to unify all spheres in the model to the same mesh.
    The `model_name` variable should be set to the name of the model object in the scene.
"""

model_name = "good_men"  # Set this to the name of the model object in the scene


from typing import cast

import bpy


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


sphere_mesh = find_first_mesh("Sphere")
model_objs = bpy.data.objects[model_name].children_recursive
if sphere_mesh is not None:
    sphere_mesh.name = f"{model_name}.Sphere"

    for obj in model_objs:
        if obj.type == "EMPTY" or not obj.data:
            continue
        if "Sphere" in obj.data.name and obj.data != sphere_mesh:
            old_mesh = cast(bpy.types.Mesh, obj.data)
            obj.data = sphere_mesh
            print(f"removed mesh {old_mesh.name}")
            bpy.data.meshes.remove(old_mesh, do_unlink=True)
