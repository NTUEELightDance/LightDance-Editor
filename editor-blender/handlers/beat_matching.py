import csv
import os
from typing import Any, cast

import bpy
import bpy.path
import gpu
from gpu_extras import batch as g_batch

from ..core.config import config
from ..core.log import logger
from ..core.states import state
from ..core.utils.ui import redraw_area


class BeatSettings:
    def __init__(self):
        self.region: bpy.types.Region | None = None
        self.shader: gpu.types.GPUShader | None = None
        self.batches: list[gpu.types.GPUBatch] = []
        self.handle_dope: Any = None


beat_settings = BeatSettings()


def draw():
    global beat_settings

    shader = beat_settings.shader
    batches = beat_settings.batches
    region = beat_settings.region

    if shader is None or region is None:
        return

    x0 = cast(float, region.view2d.region_to_view(0, 0)[0])
    x1 = cast(float, region.view2d.region_to_view(region.width, 0)[0])
    x_mid = (x0 + x1) / 2
    x_scale = x1 - x_mid

    shader.uniform_float("view_x_mid", x_mid)  # type: ignore
    shader.uniform_float("view_x_scale", x_scale)  # type: ignore

    for batch in batches:
        batch.draw(shader)


def mount():
    global beat_settings

    # Load beat data
    beat_path = os.path.join(config.ASSET_PATH, "data/beat.csv")

    with open(beat_path, "r", encoding="utf-8") as file:
        reader = list(csv.reader(file))  # Convert reader object to list

    # Transpose and flatten (column-wise reading)
    top_row = reader[0]
    data = [
        reader[row][col] for col in range(len(reader[0])) for row in range(len(reader))
    ]

    # Ensure are integers
    top_row = list(map(int, top_row))
    data = list(map(int, data))

    state.music_beats = data
    state.scene_start_point = top_row

    # Add timeline marker for the start point of each scene
    scene = bpy.data.scenes["Scene"]
    for i, timepoint in enumerate(top_row):
        marker_name = f"Scene {i+1}"
        scene.timeline_markers.new(marker_name, frame=timepoint)

    # Find timeline region
    screen = cast(bpy.types.Screen, bpy.data.screens["Layout"])
    area = next(
        area
        for area in cast(list[bpy.types.Area], screen.areas)
        if area.ui_type == "TIMELINE"
    )
    region = next(
        region
        for region in cast(list[bpy.types.Region], area.regions)
        if region.type == "WINDOW"
    )

    # Create shader
    vert_out = gpu.types.GPUStageInterfaceInfo("my_interface")  # type: ignore
    vert_out.smooth("VEC3", "pos")

    shader_info = gpu.types.GPUShaderCreateInfo()
    shader_info.push_constant("FLOAT", "view_x_mid")
    shader_info.push_constant("FLOAT", "view_x_scale")

    shader_info.vertex_in(0, "VEC2", "position")
    shader_info.vertex_out(vert_out)
    shader_info.fragment_out(0, "VEC4", "FragColor")

    shader_info.vertex_source(
        """
        void main() {
            float x = (position[0] - view_x_mid) / view_x_scale;
            float y = position[1];
            gl_Position = vec4(x, y, 0.0, 1.0);
        }
        """
    )
    shader_info.fragment_source(
        """
        void main() {
            // Use red lines to mark beat points
            FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
        """
    )

    shader = gpu.shader.create_from_info(shader_info)

    del vert_out
    del shader_info

    beat_settings.shader = shader
    beat_settings.region = region

    # Create batches for drawing lines
    top = region.view2d.region_to_view(0, region.height)[1]

    for x in data:
        points = [
            (x, top * (-0.55)),
            (x, top * 0.46),
        ]
        batch = g_batch.batch_for_shader(shader, "LINES", {"position": points})
        if beat_settings.batches is not None:
            beat_settings.batches.append(batch)

    # Enable handler
    beat_settings.handle_dope = bpy.types.SpaceDopeSheetEditor.draw_handler_add(
        draw, (), "WINDOW", "POST_PIXEL"
    )

    logger.info("Beatpoints loaded")
    redraw_area({"DOPESHEET_EDITOR"})


def unmount():
    global beat_settings

    if beat_settings.handle_dope is not None:
        bpy.types.SpaceDopeSheetEditor.draw_handler_remove(
            beat_settings.handle_dope, "WINDOW"
        )
        beat_settings.handle_dope = None

    redraw_area({"DOPESHEET_EDITOR"})
