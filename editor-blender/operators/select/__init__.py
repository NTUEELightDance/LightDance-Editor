from random import randint, sample
from typing import cast

import bpy

from ...core.models import Editor, SelectMode
from ...core.states import state


class SelectAllOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_all"
    bl_label = "Select All"
    bl_description = "Select all target objects"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        match state.editor:
            case Editor.CONTROL_EDITOR:
                if state.selection_mode == SelectMode.DANCER_MODE:
                    state.selection_mode = SelectMode.PART_MODE
                bpy.ops.wm.call_menu(name="LD_MT_control_editor_select_all")
            case Editor.POS_EDITOR:
                bpy.ops.object.select_all()
            case Editor.LED_EDITOR:
                bpy.ops.object.select_all()
        return {"FINISHED"}


class ControlEditorSelectAllMenu(bpy.types.Menu):
    bl_idname = "LD_MT_control_editor_select_all"
    bl_label = "Select"

    def draw(self, context):
        layout = self.layout
        layout.operator("lightdance.select_all_led")
        layout.operator("lightdance.select_all_fiber")
        layout.operator("lightdance.select_random_led")
        layout.operator("lightdance.select_random_fiber")


class SelectAllLEDOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_all_led"
    bl_label = "Select All LEDs"
    bl_description = "Select all target LEDs"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        bpy.ops.object.select_all(action="DESELECT")
        for obj in bpy.context.view_layer.objects:
            obj = cast(bpy.types.Object, obj)
            if getattr(obj, "ld_light_type") == "led":
                obj.select_set(True)
        return {"FINISHED"}


class SelectAllFiberOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_all_fiber"
    bl_label = "Select All Fibers"
    bl_description = "Select all target fibers"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        bpy.ops.object.select_all(action="DESELECT")
        for obj in bpy.context.view_layer.objects:
            obj = cast(bpy.types.Object, obj)
            if getattr(obj, "ld_light_type") == "fiber":
                obj.select_set(True)
        return {"FINISHED"}


class SelectRandomFiberOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_random_fiber"
    bl_label = "Select Random Fibers"
    bl_description = "Select random target fibers"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        bpy.ops.object.select_all(action="DESELECT")
        fiber_list = [
            cast(bpy.types.Object, obj)
            for obj in bpy.context.view_layer.objects
            if getattr(obj, "ld_light_type") == "fiber"
        ]
        N_fiber = len(fiber_list)
        n_select = randint(1, N_fiber)
        random_list = sample(fiber_list, n_select)
        for obj in random_list:
            obj.select_set(True)
        print(f"Selected {n_select} fibers out of {N_fiber}")
        return {"FINISHED"}


class SelectRandomLEDOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_random_led"
    bl_label = "Select Random LEDs"
    bl_description = "Select random target LEDs"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        bpy.ops.object.select_all(action="DESELECT")
        led_list = [
            cast(bpy.types.Object, obj)
            for obj in bpy.context.view_layer.objects
            if getattr(obj, "ld_light_type") == "led"
        ]
        N_led = len(led_list)
        n_select = randint(1, N_led)
        random_list = sample(led_list, n_select)
        for obj in random_list:
            obj.select_set(True)
        print(f"Selected {n_select} LEDs out of {N_led}")
        return {"FINISHED"}


def register():
    bpy.utils.register_class(SelectAllOperator)
    bpy.utils.register_class(ControlEditorSelectAllMenu)
    bpy.utils.register_class(SelectAllFiberOperator)
    bpy.utils.register_class(SelectAllLEDOperator)
    bpy.utils.register_class(SelectRandomLEDOperator)
    bpy.utils.register_class(SelectRandomFiberOperator)


def unregister():
    bpy.utils.unregister_class(SelectAllOperator)
    bpy.utils.unregister_class(ControlEditorSelectAllMenu)
    bpy.utils.unregister_class(SelectAllFiberOperator)
    bpy.utils.unregister_class(SelectAllLEDOperator)
    bpy.utils.unregister_class(SelectRandomLEDOperator)
    bpy.utils.unregister_class(SelectRandomFiberOperator)
