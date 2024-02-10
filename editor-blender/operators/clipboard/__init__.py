from typing import Dict, List, Optional, cast

import bpy

from ...core.models import (
    CopiedDancerData,
    CopiedPartData,
    CopiedType,
    EditMode,
    Editor,
    PartName,
    SelectMode,
)
from ...core.states import state
from ...core.utils.notification import notify
from ...properties.types import LightType, ObjectType

default_keymaps = ["view3d.copybuffer", "view3d.pastebuffer"]


# TODO: Add base model to dancer for varification


class CopyOperator(bpy.types.Operator):
    bl_idname = "lightdance.copy"
    bl_label = "Copy"

    def execute(self, context: bpy.types.Context):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", "Not Control Editor")
            return {"FINISHED"}

        if state.edit_state == EditMode.IDLE:
            notify("INFO", "Not Edit Mode")
            return {"FINISHED"}

        data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

        if state.selection_mode == SelectMode.DANCER_MODE:
            if len(state.selected_obj_names) != 1:
                return {"CANCELLED"}

            selected_obj_name = state.selected_obj_names[0]
            selected_obj = data_objects[selected_obj_name]

            ld_object_type: str = getattr(selected_obj, "ld_object_type")
            if ld_object_type != ObjectType.DANCER.value:
                return {"CANCELLED"}

            clipboard = state.clipboard
            clipboard.type = CopiedType.DANCER

            dancer_name: str = getattr(selected_obj, "ld_dancer_name")
            model_name: str = getattr(selected_obj, "ld_model_name")

            dancer_status: Dict[PartName, CopiedPartData] = {}
            clipboard.dancer = CopiedDancerData(
                name=dancer_name, model=model_name, parts=dancer_status
            )

            for part_obj in selected_obj.children:
                ld_object_type: str = getattr(part_obj, "ld_object_type")
                if ld_object_type != ObjectType.LIGHT.value:
                    continue

                part_name: str = getattr(part_obj, "ld_part_name")
                part_type: str = getattr(part_obj, "ld_light_type")

                if part_type == LightType.FIBER.value:
                    ld_color: str = getattr(part_obj, "ld_color")
                    ld_alpha: int = getattr(part_obj, "ld_alpha")

                    dancer_status[part_name] = CopiedPartData(
                        alpha=ld_alpha,
                        color=ld_color,
                    )

                elif part_type == LightType.LED.value:
                    ld_effect: str = getattr(part_obj, "ld_effect")
                    ld_alpha: int = getattr(part_obj, "ld_alpha")

                    dancer_status[part_name] = CopiedPartData(
                        alpha=ld_alpha,
                        effect=ld_effect,
                    )

        elif state.selection_mode == SelectMode.PART_MODE:
            selected_obj_dancer_names = [
                cast(str, getattr(data_objects[obj_name], "ld_dancer_name"))
                for obj_name in state.selected_obj_names
            ]

            # check if all selected objects are from the same dancer
            if selected_obj_dancer_names.count(selected_obj_dancer_names[0]) != len(
                selected_obj_dancer_names
            ):
                return {"CANCELLED"}

            dancer_name = selected_obj_dancer_names[0]
            dancer_obj = data_objects[dancer_name]
            model_name: str = getattr(dancer_obj, "ld_model_name")

            selected_obj_names = state.selected_obj_names
            selected_objs = [data_objects[obj_name] for obj_name in selected_obj_names]

            clipboard = state.clipboard
            clipboard.type = CopiedType.DANCER

            dancer_status: Dict[PartName, CopiedPartData] = {}
            clipboard.dancer = CopiedDancerData(
                name=dancer_name, model=model_name, parts=dancer_status
            )

            for part_obj in selected_objs:
                ld_object_type: str = getattr(part_obj, "ld_object_type")
                if ld_object_type != ObjectType.LIGHT.value:
                    continue

                part_name: str = getattr(part_obj, "ld_part_name")
                part_type: str = getattr(part_obj, "ld_light_type")

                if part_type == LightType.FIBER.value:
                    ld_color: str = getattr(part_obj, "ld_color")
                    ld_alpha: int = getattr(part_obj, "ld_alpha")

                    dancer_status[part_name] = CopiedPartData(
                        alpha=ld_alpha,
                        color=ld_color,
                    )

                elif part_type == LightType.LED.value:
                    ld_effect: str = getattr(part_obj, "ld_effect")
                    ld_alpha: int = getattr(part_obj, "ld_alpha")

                    dancer_status[part_name] = CopiedPartData(
                        alpha=ld_alpha,
                        effect=ld_effect,
                    )

        return {"FINISHED"}


class PasteOperator(bpy.types.Operator):
    bl_idname = "lightdance.paste"
    bl_label = "Paste"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context: bpy.types.Context):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", f"Not Control Editor")
            return {"FINISHED"}

        if state.edit_state == EditMode.IDLE:
            notify("INFO", f"Not Edit Mode")
            return {"FINISHED"}

        clipboard = state.clipboard
        if clipboard.type == CopiedType.NONE:
            notify("INFO", f"Not copied yet")
            return {"FINISHED"}

        data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

        if state.selection_mode == SelectMode.DANCER_MODE:
            copied_dancer = clipboard.dancer
            if copied_dancer is None:
                return {"CANCELLED"}

            for dancer_obj_name in state.selected_obj_names:
                dancer_obj = data_objects[dancer_obj_name]

                ld_object_type: str = getattr(dancer_obj, "ld_object_type")
                if ld_object_type != ObjectType.DANCER.value:
                    return {"CANCELLED"}

                # dancer_name: str = getattr(selected_obj, "ld_dancer_name")
                # model_name: str = getattr(selected_obj, "ld_model_name")

                for part_obj in dancer_obj.children:
                    ld_object_type: str = getattr(part_obj, "ld_object_type")
                    if ld_object_type != ObjectType.LIGHT.value:
                        continue

                    part_name: str = getattr(part_obj, "ld_part_name")
                    part_type: str = getattr(part_obj, "ld_light_type")

                    if part_name in copied_dancer.parts:
                        copied_part_data = copied_dancer.parts[part_name]

                        if part_type == LightType.FIBER.value:
                            copied_color: Optional[str] = copied_part_data.color
                            copied_alpha: int = copied_part_data.alpha

                            if copied_color is not None:
                                setattr(part_obj, "ld_color", copied_color)
                                setattr(part_obj, "ld_alpha", copied_alpha)

                        elif part_type == LightType.LED.value:
                            copied_effect: Optional[str] = copied_part_data.effect
                            copied_alpha: int = copied_part_data.alpha

                            if copied_effect is not None:
                                setattr(part_obj, "ld_effect", copied_effect)
                                setattr(part_obj, "ld_alpha", copied_alpha)

        elif state.selection_mode == SelectMode.PART_MODE:
            copied_dancer = clipboard.dancer
            if copied_dancer is None:
                return {"CANCELLED"}

            selected_dancer_objs: Dict[str, List[bpy.types.Object]] = {}
            for obj_name in state.selected_obj_names:
                obj = data_objects[obj_name]
                dancer_name: str = getattr(obj, "ld_dancer_name")

                if dancer_name not in selected_dancer_objs:
                    selected_dancer_objs[dancer_name] = []

                selected_dancer_objs[dancer_name].append(obj)

            for dancer_name, dancer_part_objs in selected_dancer_objs.items():
                dancer_obj = data_objects[dancer_name]

                ld_object_type: str = getattr(dancer_obj, "ld_object_type")
                if ld_object_type != ObjectType.DANCER.value:
                    return {"CANCELLED"}

                for part_obj in dancer_part_objs:
                    ld_object_type: str = getattr(part_obj, "ld_object_type")
                    if ld_object_type != ObjectType.LIGHT.value:
                        continue

                    part_name: str = getattr(part_obj, "ld_part_name")
                    part_type: str = getattr(part_obj, "ld_light_type")

                    if part_name in copied_dancer.parts:
                        copied_part_data = copied_dancer.parts[part_name]

                        if part_type == LightType.FIBER.value:
                            copied_color: Optional[str] = copied_part_data.color
                            copied_alpha: int = copied_part_data.alpha

                            if copied_color is not None:
                                setattr(part_obj, "ld_color", copied_color)
                                setattr(part_obj, "ld_alpha", copied_alpha)

                        elif part_type == LightType.LED.value:
                            copied_effect: Optional[str] = copied_part_data.effect
                            copied_alpha: int = copied_part_data.alpha

                            if copied_effect is not None:
                                setattr(part_obj, "ld_effect", copied_effect)
                                setattr(part_obj, "ld_alpha", copied_alpha)

        return {"FINISHED"}


def check_keymaps_exist(
    keymaps: List[bpy.types.KeyMapItem],
    names: List[str],
    ctrl: List[int],
    oskey: List[int],
) -> List[Optional[bpy.types.KeyMapItem]]:
    wm = bpy.context.window_manager
    kc_items = cast(Dict[str, bpy.types.KeyMap], wm.keyconfigs.default.keymaps)[
        "3D View"
    ].keymap_items
    kc_items = cast(List[bpy.types.KeyMapItem], kc_items)

    results: List[Optional[bpy.types.KeyMapItem]] = [None] * len(names)

    for keymap in keymaps:
        for i in range(len(names)):
            if (
                keymap.idname == names[i]
                and keymap.ctrl == ctrl[i]
                and keymap.oskey == oskey[i]
            ):
                results[i] = keymap

    return results


def register():
    bpy.utils.register_class(CopyOperator)
    bpy.utils.register_class(PasteOperator)

    # Active keymaps and disable default keymaps

    wm = bpy.context.window_manager
    km_items = cast(Dict[str, bpy.types.KeyMap], wm.keyconfigs.default.keymaps)[
        "3D View"
    ].keymap_items
    km_items = cast(List[bpy.types.KeyMapItem], km_items)

    for keymap in km_items:
        if keymap.idname in default_keymaps:
            keymap.active = False

    new_keymaps_config = (
        [
            "lightdance.copy",
            "lightdance.copy",
            "lightdance.paste",
            "lightdance.paste",
        ],
        ["C", "C", "V", "V"],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
    )

    new_keymaps = check_keymaps_exist(
        km_items,
        new_keymaps_config[0],
        new_keymaps_config[2],
        new_keymaps_config[3],
    )

    km_items = cast(bpy.types.KeyMapItems, km_items)
    for i in range(len(new_keymaps)):
        new_keymap = new_keymaps[i]

        if new_keymap is None:
            new_keymaps[i] = km_items.new(
                new_keymaps_config[0][i],
                new_keymaps_config[1][i],
                ctrl=new_keymaps_config[2][i],
                oskey=new_keymaps_config[3][i],
                value="PRESS",
            )

        else:
            new_keymap.active = True

    global clipboard_keymaps

    clipboard_keymaps = cast(List[bpy.types.KeyMapItem], new_keymaps)


def unregister():
    bpy.utils.unregister_class(CopyOperator)
    bpy.utils.unregister_class(PasteOperator)

    for keymap in clipboard_keymaps:
        keymap.active = False