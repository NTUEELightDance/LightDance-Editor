import json
import os
from typing import Any, List, Optional, cast

import bpy
import bpy.path
import gpu
from gpu_extras import batch as g_batch

from ..core.states import state
from ..core.utils.ui import redraw_area


class WaveformSettings:
    def __init__(self):
        self.region: Optional[bpy.types.Region] = None
        self.shader: Optional[gpu.types.GPUShader] = None
        self.batch: Optional[gpu.types.GPUBatch] = None
        self.handle_dope: Any = None


waveform_settings = WaveformSettings()


def draw():
    global waveform_settings

    shader = waveform_settings.shader
    batch = waveform_settings.batch
    region = waveform_settings.region

    if shader is None or batch is None or region is None:
        return

    x0 = cast(float, region.view2d.region_to_view(0, 0)[0])
    x1 = cast(float, region.view2d.region_to_view(region.width, 0)[0])
    x_mid = (x0 + x1) / 2
    x_scale = x1 - x_mid

    shader.uniform_float("view_x_mid", x_mid)  # type: ignore
    shader.uniform_float("view_x_scale", x_scale)  # type: ignore

    batch.draw(shader)


def mount():
    global waveform_settings

    # Load waveform data
    waveform_path = os.path.join(state.assets_path, "data/waveform.json")

    try:
        waveform_file = open(waveform_path, "r")
    except FileNotFoundError:
        print(f"Waveform file not found: {waveform_path}")
        return

    waveform_data = json.load(waveform_file)

    data: List[int] = waveform_data["data"]
    length: int = waveform_data["length"]
    wave_bits: int = waveform_data["bits"]

    samples_per_pixel: int = waveform_data["samples_per_pixel"]
    sample_rate: int = waveform_data["sample_rate"]
    milliseconds = int(length * samples_per_pixel / sample_rate * 1000)

    data_range = 1 << (wave_bits - 1)
    point_coords = [
        (milliseconds * pos / (2 * length), val / data_range)
        for pos, val in enumerate(data)
    ]

    # Find timeline region
    screen = cast(bpy.types.Screen, bpy.data.screens["Layout"])
    area = next(
        area
        for area in cast(List[bpy.types.Area], screen.areas)
        if area.type == "DOPESHEET_EDITOR"
    )
    region = next(
        region
        for region in cast(List[bpy.types.Region], area.regions)
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
            pos = vec3(x, y, 0.0);
            gl_Position = vec4(x, y, 0.0, 1.0);
        }
        """
    )

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

    print("Waveform loaded")
    redraw_area({"DOPESHEET_EDITOR"})


def unmount():
    global waveform_settings

    if waveform_settings.handle_dope is not None:
        bpy.types.SpaceDopeSheetEditor.draw_handler_remove(
            waveform_settings.handle_dope, "WINDOW"
        )
        waveform_settings.handle_dope = None

    redraw_area({"DOPESHEET_EDITOR"})
