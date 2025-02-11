import bpy

from ...core.actions.state.timeline import (
    decrease_beat_index,
    decrease_frame_index,
    increase_beat_index,
    increase_frame_index,
)
from ...core.models import Editor
from ...core.states import state
from ...core.utils.algorithms import binary_search_for_neighbors


class IncreaseFrameIndex(bpy.types.Operator):
    """Increase frame index by 1"""

    bl_idname = "lightdance.increase_frame_index"
    bl_label = "Increase Frame Index"

    def execute(self, context: bpy.types.Context | None):
        increase_frame_index()
        return {"FINISHED"}


class DecreaseFrameIndex(bpy.types.Operator):
    """Decrease frame index by 1"""

    bl_idname = "lightdance.decrease_frame_index"
    bl_label = "Decrease Frame Index"

    def execute(self, context: bpy.types.Context | None):
        decrease_frame_index()
        return {"FINISHED"}


class IncreaseBeatIndex(bpy.types.Operator):
    """Increase beat index by 1"""

    bl_idname = "lightdance.increase_beat_index"
    bl_label = "Increase Beat Index"

    def execute(self, context: bpy.types.Context | None):
        increase_beat_index()
        return {"FINISHED"}


class DecreaseBeatIndex(bpy.types.Operator):
    """Decrease beat index by 1"""

    bl_idname = "lightdance.decrease_beat_index"
    bl_label = "Decrease Beat Index"

    def execute(self, context: bpy.types.Context | None):
        decrease_beat_index()
        return {"FINISHED"}


def register():
    bpy.utils.register_class(IncreaseFrameIndex)
    bpy.utils.register_class(DecreaseFrameIndex)
    bpy.utils.register_class(IncreaseBeatIndex)
    bpy.utils.register_class(DecreaseBeatIndex)


def unregister():
    bpy.utils.unregister_class(IncreaseFrameIndex)
    bpy.utils.unregister_class(DecreaseFrameIndex)
    bpy.utils.unregister_class(IncreaseBeatIndex)
    bpy.utils.unregister_class(DecreaseBeatIndex)
