import os
import subprocess
from os import path

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
req_path = path.join(current_dir, "requirements.py")
subprocess.run(["cp", req_path, pack_blender_path])

# Remove release folder
release_path = path.join(pack_blender_path, "release")
subprocess.run(["rm", "-r", release_path])

# Remove testing folder
tests_path = path.join(pack_blender_path, "tests")
subprocess.run(["rm", "-r", tests_path])


def remove_pycache(root_dir: str):
    for dir in os.listdir(root_dir):
        if dir == "__pycache__":
            dir = path.join(root_dir, dir)
            subprocess.run(["rm", "-r", dir])
        elif path.isdir(path.join(root_dir, dir)):
            remove_pycache(path.join(root_dir, dir))


# Remove __pycache__
remove_pycache(pack_blender_path)

# Zip
subprocess.run(["zip", "-r", f"{folder_name}.zip", folder_name], cwd=pack_dir)
subprocess.run(["mv", f"{folder_name}.zip", root_dir], cwd=pack_dir)

# Remove temp folder
subprocess.run(["rm", "-r", pack_dir])
