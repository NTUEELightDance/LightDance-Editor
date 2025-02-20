import csv
import os

import bpy

from ....config import config
from ....states import state
from ....utils.convert import csv_second_to_miliseconds


def setup_scene_marker():
    # Load beat data
    beat_path = os.path.join(config.ASSET_PATH, "data/beat.csv")

    with open(beat_path, "r", encoding="utf-8") as file:
        reader = list(csv.reader(file))  # Convert reader object to list

    # Transpose and flatten (column-wise reading)
    scene_row = reader[0]  # Scene names (1, 2, 3, 4-1, 4-2, ...)
    start_row = reader[1]  # Scene start frames

    # Convert to miliseconds
    scene_start_points = list(map(csv_second_to_miliseconds, start_row))

    state.scene_start_point = scene_start_points

    # Add timeline marker for the start point of each scene
    scene = bpy.data.scenes["Scene"]
    for title, timepoint in zip(scene_row, scene_start_points):
        marker_name = f"Scene {title}"
        scene.timeline_markers.new(marker_name, frame=timepoint)
