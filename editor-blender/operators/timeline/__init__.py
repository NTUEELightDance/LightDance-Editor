import bpy

from ...core.actions.state.timeline import decrease_frame_index, increase_frame_index


class IncreaseFrameIndex(bpy.types.Operator):
    """Increase frame index by 1"""

    bl_idname = "lightdance.increase_frame_index"
    bl_label = "Increase Frame Index"

    def execute(self, context: bpy.types.Context):
        increase_frame_index()
        return {"FINISHED"}


class DecreaseFrameIndex(bpy.types.Operator):
    """Decrease frame index by 1"""

    bl_idname = "lightdance.decrease_frame_index"
    bl_label = "Decrease Frame Index"

    def execute(self, context: bpy.types.Context):
        decrease_frame_index()
        return {"FINISHED"}


def register():
    bpy.utils.register_class(IncreaseFrameIndex)
    bpy.utils.register_class(DecreaseFrameIndex)


def unregister():
    bpy.utils.unregister_class(IncreaseFrameIndex)
    bpy.utils.unregister_class(DecreaseFrameIndex)
