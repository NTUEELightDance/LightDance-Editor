from collections.abc import Callable
from typing import Any

import bpy

from ..core.log import logger


def execute_operator(idname: str):
    attrs = idname.split(".")
    if len(attrs) != 2:
        logger.error(f"Invalid idname: {idname}")
        return

    module_name, ops_name = attrs

    try:
        module = getattr(bpy.ops, module_name)
        ops: Callable[[str], Any] = getattr(module, ops_name)
        ops("INVOKE_DEFAULT")
        logger.debug(f"Executed operator: {idname}")
    except:
        logger.exception(f"Failed to execute operator {idname}")


class EmptyOperator(bpy.types.Operator):
    bl_idname = "lightdance.empty"
    bl_label = "Empty Operator"

    def execute(self, context: bpy.types.Context | None):
        return {"FINISHED"}


def register():
    bpy.utils.register_class(EmptyOperator)


def unregister():
    bpy.utils.unregister_class(EmptyOperator)
