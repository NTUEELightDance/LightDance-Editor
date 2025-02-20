import os
import subprocess
from argparse import ArgumentParser
from os import path

import toml

parser = ArgumentParser()

parser.add_argument("-r", "--pack", action="store_true")
parser.parse_args()

pack_for_release = parser.parse_args().pack

pack_name = "__blender_temp__"
folder_name = "editor-blender"

current_dir = path.dirname(path.realpath(__file__))
root_dir = path.dirname(path.dirname(current_dir))
blender_dir = path.join(root_dir, "editor-blender")

# Create temp folder
pack_dir = path.join(root_dir, pack_name)
if not path.exists(pack_dir):
    os.mkdir(pack_dir)

# Copy blender dir
subprocess.run(["cp", "-r", blender_dir, pack_dir])
pack_blender_path = path.join(pack_dir, "editor-blender")

# Copy requirements.py
# if pack_for_release:
#     req_path = path.join(current_dir, "requirements.py")
#     subprocess.run(["cp", req_path, pack_blender_path])

# Copy dotenv
if pack_for_release:
    dotenv_path = path.join(blender_dir, "pack", ".env.production")
    target_path = path.join(pack_blender_path, ".env")
    subprocess.run(["cp", dotenv_path, target_path])
else:
    dotenv_path = path.join(blender_dir, ".env.development")
    target_path = path.join(pack_blender_path, ".env")
    subprocess.run(["cp", dotenv_path, target_path])

# Remove pack folder
release_path = path.join(pack_blender_path, "pack")
subprocess.run(["rm", "-r", release_path])

# Remove testing folder
tests_path = path.join(pack_blender_path, "tests")
subprocess.run(["rm", "-rf", tests_path])

# Remove venv folder
venv_path = path.join(pack_blender_path, ".venv")
subprocess.run(["rm", "-rf", venv_path])


def remove_pycache(root_dir: str):
    for dir in os.listdir(root_dir):
        if dir == "__pycache__":
            dir = path.join(root_dir, dir)
            subprocess.run(["rm", "-r", dir])
        elif path.isdir(path.join(root_dir, dir)):
            remove_pycache(path.join(root_dir, dir))


# Remove __pycache__
remove_pycache(pack_blender_path)

# Update manifest file

wheels_dir = f"{pack_blender_path}/wheels"
manifest_file = f"{pack_blender_path}/blender_manifest.toml"

# Get list of .whl files
wheels_list = [
    f"./wheels/{filename}"
    for filename in os.listdir(wheels_dir)
    if filename.endswith(".whl")
]

# Read the existing manifest file
with open(manifest_file, "r") as f:
    manifest_data = toml.load(f)

# Update the wheels list in the manifest data
manifest_data["wheels"] = wheels_list

# Write the updated manifest data back to the file
with open(manifest_file, "w") as f:
    toml.dump(manifest_data, f)

# Zip
subprocess.run(["zip", "-rq", f"{folder_name}.zip", folder_name], cwd=pack_dir)
subprocess.run(["mv", f"{folder_name}.zip", root_dir], cwd=pack_dir)

print("Packed successfully.")

# Remove temp folder
subprocess.run(["rm", "-r", pack_dir])
