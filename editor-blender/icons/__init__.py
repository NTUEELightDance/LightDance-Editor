import os
from os import path
from typing import Dict, List, Tuple

import bpy
import bpy.utils.previews

from ..core.models import Color

icon_collections: Dict[str, bpy.utils.previews.ImagePreviewCollection] = {}


TEMPLATE = """
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 ($size) ($size)" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="f1" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
    </defs>
    <ellipse 
        style="fill: rgb(($r), ($g), ($b)); 
        stroke: rgb(($r), ($g), ($b));" 
        cx="($cx)" cy="($cy)" rx="($rx)" ry="($ry)" 
    />
</svg>
"""


def generate_icon(rgb: Tuple[int, int, int], size: int, fill: float) -> str:
    radius = size / 2 * fill

    content = TEMPLATE.replace("($size)", str(size))
    content = content.replace("($r)", str(rgb[0]))
    content = content.replace("($g)", str(rgb[1]))
    content = content.replace("($b)", str(rgb[2]))
    content = content.replace("($cx)", str(size / 2))
    content = content.replace("($cy)", str(size / 2))
    content = content.replace("($rx)", str(radius))
    content = content.replace("($ry)", str(radius))

    return content


def generate_icon_images(colors: List[Color], clear: bool = False):
    collection = bpy.utils.previews.new()
    icon_collections["main"] = collection

    current_dir = path.dirname(__file__)
    root_dir = path.dirname(current_dir)
    icon_dir = path.join(root_dir, "icons")

    # Create icon directory
    if not path.exists(icon_dir):
        os.mkdir(icon_dir)

    if clear:
        for file in os.listdir(icon_dir):
            if file.endswith(".svg"):
                os.remove(path.join(icon_dir, file))

    for color in colors:
        color_icon_path = path.join(icon_dir, f"{color.name}.svg")
        if not path.exists(color_icon_path):
            with open(color_icon_path, "w") as f:
                file_content = generate_icon(color.rgb, 500, 0.7)
                f.write(file_content)

        collection.load(color.name, color_icon_path, "IMAGE")


def update_icon_images(color: Color):
    collection = icon_collections["main"]
    current_dir = path.dirname(__file__)
    root_dir = path.dirname(current_dir)
    icon_dir = path.join(root_dir, "icons")

    color_icon_path = path.join(icon_dir, f"{color.name}.svg")
    if path.exists(color_icon_path):
        os.remove(color_icon_path)

    with open(color_icon_path, "w") as f:
        file_content = generate_icon(color.rgb, 500, 0.7)
        f.write(file_content)

    collection.load(color.name, color_icon_path, "IMAGE")
