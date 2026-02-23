import bpy

from ...core.models import Editor, SelectMode
from ...core.states import state


class PinPanel(bpy.types.Panel):
    """Pin Panel"""

    bl_label = "Pin"
    bl_idname = "LIGHTDANCE_PT_pin"
    bl_space_type = "DOPESHEET_EDITOR"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context | None):
        if not context:
            return
        if not state.ready:
            return

        layout = self.layout
        layout.enabled = (
            not state.shifting and not state.requesting and not state.playing
        )

        box = layout.box()
        col = box.column(align=True)

        row = col.row(align=True)
        row.label(text="Pinned Dancers")

        for i, object in enumerate(state.pinned_objects):
            row = col.row()
            row.label(text=f"{object}", icon="PINNED")
            op = row.operator(operator="lightdance.delete_pinned_object", text="Delete")
            op.index = i  # type: ignore

        obj = context.object
        row = layout.row(align=True)
        if obj:
            dancer_name = getattr(obj, "ld_dancer_name")
            row.operator(
                operator="lightdance.pin_object", text=f"Pin {dancer_name}", icon="ADD"
            )

        else:
            if state.editor == Editor.POS_EDITOR:
                row.label(text="Select a dancer to pin", icon="ADD")

            elif state.editor == Editor.CONTROL_EDITOR:
                if state.selection_mode == SelectMode.DANCER_MODE:
                    row.label(text="Select a dancer to pin")
                else:
                    row.label(text="Select a part to pin dancer", icon="ADD")

        row = layout.row(align=True)
        row.operator(
            operator="lightdance.pin_all_dancers", text="Pin All Dancers", icon="ADD"
        )


def register():
    bpy.utils.register_class(PinPanel)


def unregister():
    bpy.utils.unregister_class(PinPanel)
