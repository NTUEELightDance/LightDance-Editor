import bpy

from ...states import state


def update_color(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO:
    print("TEST: update_color")


def update_effect(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO:
    print("TEST: update_effect")


def update_alpha(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO:
    print("TEST: update_alpha")
