import bpy


class PropertyPanel(bpy.types.Panel):
    bl_label = "Light Property"
    bl_idname = "VIEW_PT_Property"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context):
        layout = self.layout

        ld_object_type: str = getattr(context.object, "ld_object_type", "")

        if ld_object_type == "light":
            row = layout.row()
            ld_light_type: str = getattr(context.object, "ld_light_type", "")

            if ld_light_type == "led":
                row.label(text="Effect", icon="WORLD_DATA")
                row.prop(context.object, "ld_effect", text="")
            else:
                row.label(text="Color", icon="WORLD_DATA")
                row.prop(context.object, "ld_color", text="")

            row = layout.row()
            row.prop(context.object, "ld_alpha", text="Alpha")


def register():
    bpy.utils.register_class(PropertyPanel)


def unregister():
    bpy.utils.unregister_class(PropertyPanel)
