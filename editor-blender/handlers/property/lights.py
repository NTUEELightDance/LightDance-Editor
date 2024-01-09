import bpy

from ...core.states import state


def update_color(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO: Update ld_color and color in fcurve
    print("TEST: update_color")


def update_effect(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO: Update ld_effect and colors of leds in fcurve
    print("TEST: update_effect")


def update_alpha(self: bpy.types.Object, context: bpy.types.Context):
    control_index = state.current_control_index
    # TODO: Update ld_effect and colors of leds in fcurve
    print("TEST: update_alpha")
