from typing import Any

import bpy
from bpy.types import Context, UILayout

from ...core.states import state
from ...properties.types import Preferences

##
from ...properties.ui.types import DancerSelectionType, TimeShiftStatusType
from ...storage import get_storage

##


def draw_time_shift(layout: bpy.types.UILayout):
    if not bpy.context:
        return
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    row = layout.row()
    row.label(text="Frame Type")
    row.prop(ld_ui_time_shift, "frame_type", text="")

    col = layout.column(align=True)
    col.prop(ld_ui_time_shift, "start", text="Start")
    col.prop(ld_ui_time_shift, "end", text="End")
    col.prop(ld_ui_time_shift, "displacement", text="Displacement")

    row = layout.row()
    row.operator("lightdance.confirm_shifting", text="Confirm", icon="CHECKMARK")
    row.operator("lightdance.cancel_shifting", text="Cancel", icon="X")


# Dancer List, but only have checkboxs for dancers
class LD_UL_PartialDancerLoad(bpy.types.UIList):
    filtering_connected: bpy.props.BoolProperty(default=False)  # type: ignore
    show_ip: bpy.props.BoolProperty(default=False)  # type: ignore
    show_mac: bpy.props.BoolProperty(default=False)  # type: ignore
    select_all: bpy.props.BoolProperty(default=False)  # type: ignore
    select_all_connect: bpy.props.BoolProperty(default=False)  # type: ignore

    def draw_item(
        self,
        context: Context | None,
        layout: UILayout,
        data: Any | None,
        item: DancerSelectionType | None,
        icon: int | None,
        active_data: Any,
        active_property: str | None,
        index: Any | None = 0,
        flt_flag: Any | None = 0,
    ):
        if not item:
            return
        column_main = layout.column()
        row = column_main.row()
        row.prop(item, "shown", text="", emboss=True)
        row.label(text=item.name)

    def draw_filter(self, context: Context | None, layout: UILayout):
        row = layout.row()
        row.prop(self, "select_all_connect", text="Select all connected RPi")
        row.prop(self, "select_all", text="Select all RPi")
        row = layout.row()
        row.prop(self, "filtering_connected", text="Show connected RPi's only")
        row.prop(self, "show_mac", text="Show MAC addresses")
        pass


class LightDancePreferencesPanel(bpy.types.Panel):
    bl_label = "Tools"
    bl_idname = "VIEW_PT_LightDance_Preferences"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"INSTANCED"}

    def draw(self, context: bpy.types.Context | None):
        layout = self.layout
        col = layout.column(align=True)

        preferences: Preferences = get_storage("preferences")

        row = col.row()
        row.prop(preferences, "auto_sync", text="Auto Sync")
        row = col.row()
        row.prop(preferences, "follow_frame", text="Follow Frame")
        row = col.row()
        row.prop(preferences, "show_waveform", text="Show Waveform")
        row = col.row()
        row.prop(preferences, "show_nametag", text="Show Nametag")


class LightDanceToolsPanel(bpy.types.Panel):
    bl_label = "Tools"
    bl_idname = "VIEW_PT_LightDance_Tools"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"INSTANCED"}

    def draw(self, context: bpy.types.Context | None):
        layout = self.layout

        if state.logged_in:
            row = layout.row()
            row.operator("lightdance.toggle_shifting", text="Timeshift", icon="TIME")
            row = layout.row()
            row.operator(
                "lightdance.reset_animation",
                text="Reset Animation",
                icon="RECOVER_LAST",
            )
            row = layout.row()
            row.operator(
                "lightdance.reload_blender", text="Reload", icon="RECOVER_LAST"
            )
            row = layout.row()
            row.operator("lightdance.logout", text="Logout", icon="GHOST_ENABLED")

        row = layout.row()
        row.operator("lightdance.clear_assets", text="Clear Assets", icon="CANCEL")


class LightDancePanel(bpy.types.Panel):
    bl_label = "LightDance"
    bl_idname = "VIEW_PT_LightDance_LightDance"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    def draw(self, context: bpy.types.Context | None):
        # Draw header
        if not bpy.context:
            return

        layout = self.layout
        layout.enabled = not state.requesting

        row = layout.row()
        if not state.logged_in:
            row.label(text="Welcome", icon="USER")
        else:
            row.label(text=state.username, icon="USER")

        row.popover("VIEW_PT_LightDance_Tools", text="Tools", icon="TOOL_SETTINGS")

        if state.logged_in:
            row.popover("VIEW_PT_LightDance_Preferences", text="", icon="SETTINGS")

        if not state.running:
            row = layout.row()
            row.operator("lightdance.async_loop", text="Start", icon="PLAY")

        else:
            if not state.logged_in:
                return

            if state.loading:
                row = layout.row()
                row.operator("lightdance.load", icon="PLAY")

                layout.row().separator(factor=2.0)

                row = layout.row()
                row.operator("lightdance.load_partial", icon="PLAY")
                row = layout.row()
                row.label(text="Loaded Frames")
                row = layout.row()
                row = row.split(factor=0.5)
                row.prop(
                    bpy.context.window_manager, "ld_ui_frame_range_min", text="start"
                )
                row.prop(
                    bpy.context.window_manager, "ld_ui_frame_range_max", text="end"
                )
                row = layout.row()
                row.label(text="Loaded Dancers")
                row = layout.row()
                row.template_list(
                    "LD_UL_PartialDancerLoad",
                    "",
                    bpy.context.window_manager,
                    "ld_ui_dancers_selection",
                    bpy.context.window_manager,
                    "ld_ui_dancer_selection_index",
                )
                bpy.context.window_manager
                return

            if state.ready:
                if state.sync:
                    if state.shifting:
                        row = layout.row()
                        row.label(text="Time Shift")

                        box = layout.box()
                        draw_time_shift(box)

                else:
                    row = layout.row()
                    row.label(text="You are currently offline")
                    row.operator(
                        "lightdance.reload_blender", text="Reload", icon="RECOVER_LAST"
                    )

            else:
                if state.user_log:
                    row = layout.row()
                    row.label(text=state.user_log, icon="TEXT")


def register():
    bpy.utils.register_class(LightDanceToolsPanel)
    bpy.utils.register_class(LightDancePreferencesPanel)
    bpy.utils.register_class(LightDancePanel)
    bpy.utils.register_class(LD_UL_PartialDancerLoad)


def unregister():
    bpy.utils.unregister_class(LightDanceToolsPanel)
    bpy.utils.unregister_class(LightDancePreferencesPanel)
    bpy.utils.unregister_class(LightDancePanel)
    bpy.utils.unregister_class(LD_UL_PartialDancerLoad)
