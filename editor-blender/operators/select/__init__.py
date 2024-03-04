import bpy


class SelectAllOperator(bpy.types.Operator):
    bl_idname = "lightdance.select_all"
    bl_label = "Select All"
    bl_description = "Select all target objects"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        return {"FINISHED"}


def register():
    bpy.utils.register_class(SelectAllOperator)


def unregister():
    bpy.utils.unregister_class(SelectAllOperator)
