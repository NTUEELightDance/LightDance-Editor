import json
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
from ..storage import get_storage


class WaveformSettings:
    def __init__(self):
        self.top_offset: int = 0
        self.bottom_offset: int = 0
        self.region: bpy.types.Region | None = None
        self.shader: gpu.types.GPUShader | None = None
        self.batch: gpu.types.GPUBatch | None = None
        self.handle_dope: Any = None


waveform_settings = WaveformSettings()


def draw():
    global waveform_settings

    shader = waveform_settings.shader
    batch = waveform_settings.batch
    region = waveform_settings.region

    if shader is None or batch is None or region is None:
        return

    if getattr(get_storage("preferences"), "show_waveform") is False:
        return

    x0 = cast(float, region.view2d.region_to_view(0, 0)[0])
    x1 = cast(float, region.view2d.region_to_view(region.width, 0)[0])
    x_mid = (x0 + x1) / 2
    x_scale = x1 - x_mid

    height = region.height
    top_offset = waveform_settings.top_offset
    bottom_offset = waveform_settings.bottom_offset

    y0 = bottom_offset
    y1 = height - top_offset
    if height == 0:
        y_mid = 0
        y_scale = 1
    else:
        y_mid = (y0 + y1 - height) / height
        y_scale = (y1 - y0) / height

    shader.uniform_float("view_x_mid", x_mid)  # type: ignore
    shader.uniform_float("view_x_scale", x_scale)  # type: ignore
    shader.uniform_float("view_y_mid", y_mid)  # type: ignore
    shader.uniform_float("view_y_scale", y_scale)  # type: ignore

    batch.draw(shader)


def mount():
    global waveform_settings

    # Load waveform data
    waveform_path = os.path.join(config.ASSET_PATH, "data/waveform.json")

    try:
        waveform_file = open(waveform_path, "r")
    except FileNotFoundError:
        logger.error(f"Waveform file not found: {waveform_path}")
        return

    waveform_data = json.load(waveform_file)

    data: list[int] = waveform_data["data"]
    length: int = waveform_data["length"]
    wave_bits: int = waveform_data["bits"]

    samples_per_pixel: int = waveform_data["samples_per_pixel"]
    sample_rate: int = waveform_data["sample_rate"]
    milliseconds = int(length * samples_per_pixel / sample_rate * 1000)

    data_range = 1 << (wave_bits - 1)
    frame_range_l, frame_range_r = state.dancer_load_frames
    point_coords = [
        (milliseconds * pos / (2 * length), val / data_range)
        for pos, val in enumerate(data)
        if pos >= 2 * frame_range_l and pos <= 2 * frame_range_r
    ]

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

    header_region = next(
        region
        for region in cast(list[bpy.types.Region], area.regions)
        if region.type == "HEADER"
    )
    waveform_settings.top_offset = int(header_region.height * 0.8)

    # Create shader
    vert_out = gpu.types.GPUStageInterfaceInfo("my_interface")  # type: ignore
    vert_out.smooth("VEC3", "pos")

    shader_info = gpu.types.GPUShaderCreateInfo()
    shader_info.push_constant("FLOAT", "view_x_mid")
    shader_info.push_constant("FLOAT", "view_x_scale")
    shader_info.push_constant("FLOAT", "view_y_mid")
    shader_info.push_constant("FLOAT", "view_y_scale")
    shader_info.vertex_in(0, "VEC2", "position")
    shader_info.vertex_out(vert_out)
    shader_info.fragment_out(0, "VEC4", "FragColor")

    shader_info.vertex_source(
        """
        void main() {
            float x = (position[0] - view_x_mid) / view_x_scale;
            float y = position[1] * view_y_scale + view_y_mid;
            pos = vec3(x, y, 0.0);
            gl_Position = vec4(x, y, 0.0, 1.0);
        }
        """
    )

    # shader_info.fragment_source(
    #     """
    #     void main() {
    #         float h = abs(pos[1] - view_y_mid);
    #         FragColor = vec4(
    #             0.24 + 0.7 * h,
    #             0.51 - 0.5 * h,
    #             0.69 - 0.7 * h,
    #             1.0
    #         );
    #     }
    #     """
    # )
    shader_info.fragment_source(
        """
        void main() {
            FragColor = vec4(0.24, 0.51, 0.69, 1.0);
        }
        """
    )

    shader = gpu.shader.create_from_info(shader_info)
    batch = g_batch.batch_for_shader(shader, "LINE_STRIP", {"position": point_coords})

    del vert_out
    del shader_info

    waveform_settings.shader = shader
    waveform_settings.batch = batch
    waveform_settings.region = region

    # Enable handler

    waveform_settings.handle_dope = bpy.types.SpaceDopeSheetEditor.draw_handler_add(
        draw, (), "WINDOW", "POST_PIXEL"
    )

    logger.info("Waveform loaded")
    redraw_area({"DOPESHEET_EDITOR"})


def unmount():
    global waveform_settings

    if waveform_settings.handle_dope is not None:
        bpy.types.SpaceDopeSheetEditor.draw_handler_remove(
            waveform_settings.handle_dope, "WINDOW"
        )
        waveform_settings.handle_dope = None

    redraw_area({"DOPESHEET_EDITOR"})
