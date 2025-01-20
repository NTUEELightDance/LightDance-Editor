import traceback
from collections.abc import Callable
from typing import Any

import bpy


def execute_operator(idname: str):
    attrs = idname.split(".")
    if len(attrs) != 2:
        print("Invalid idname:", idname)
        return

    module_name, ops_name = attrs

    try:
        module = getattr(bpy.ops, module_name)
        ops: Callable[[str], Any] = getattr(module, ops_name)
        ops("INVOKE_DEFAULT")
        print("Executed operator:", idname)
    except:
        traceback.print_exc()
        print("Failed to execute operator:", idname)


class EmptyOperator(bpy.types.Operator):
    bl_idname = "lightdance.empty"
    bl_label = "Empty Operator"

    def execute(self, context: bpy.types.Context | None):
        return {"FINISHED"}


def register():
    bpy.utils.register_class(EmptyOperator)


def unregister():
    bpy.utils.unregister_class(EmptyOperator)
