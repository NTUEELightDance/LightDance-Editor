import bpy

from ...core.utils.for_dev_only.test_keyframe import (
    renew_pos_test_frame,
    set_ctrl_test_frame,
    set_pos_test_frame,
)


class ToggleTestCtrlKeyframe(bpy.types.Operator):
    """Increase frame index by 1"""

    bl_idname = "lightdance.toggle_test_ctrl_keyframe"
    bl_label = "Toggle First Part Keyframe"

    def execute(self, context: bpy.types.Context | None):
        set_ctrl_test_frame()
        return {"FINISHED"}


class ToggleTestPosKeyframe(bpy.types.Operator):
    """Decrease beat index by 1"""

    bl_idname = "lightdance.toggle_test_pos_keyframe"
    bl_label = "Toggle First Dancer Keyframe"

    def execute(self, context: bpy.types.Context | None):
        renew_pos_test_frame()
        set_pos_test_frame()
        from ...core.log import logger
        from ...core.states import state

        for map_id, pos_map_element in state.pos_map_MODIFIED.items():
            logger.info(f"{map_id}: {pos_map_element}")
        return {"FINISHED"}


def register():
    bpy.utils.register_class(ToggleTestCtrlKeyframe)
    bpy.utils.register_class(ToggleTestPosKeyframe)


def unregister():
    bpy.utils.unregister_class(ToggleTestCtrlKeyframe)
    bpy.utils.unregister_class(ToggleTestPosKeyframe)
