from typing import List, Optional, cast

import bpy

from ....properties.types import LightType
from ...models import EditMode, LEDEffect, LEDEffectID, LEDMap
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import init_ctrl_keyframes_from_state


def set_led_map(led_map: LEDMap):
    state.led_map = led_map
    state.led_effect_id_table = {}

    for model_effects in led_map.values():
        for part_effects in model_effects.values():
            for effect in part_effects.values():
                state.led_effect_id_table[effect.id] = effect

    # TODO: Setup LED Effect List
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def add_led_effect(
    model_name: str, part_name: str, effect_name: str, effect_item: LEDEffect
):
    led_map_update = state.led_map_updates
    led_map_update.added.append((model_name, part_name, effect_name, effect_item))

    # if state.edit_state == EditMode.EDITING:
    #     state.led_map_pending.add_or_delete = True
    #     redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    # else:
    #     apply_led_map_updates_add_or_delete()
    #     notify("INFO", f"Added color {effect_name}")

    apply_led_map_updates_add_or_delete()
    notify("INFO", f"Added color {effect_name}")


def edit_led_effect(
    model_name: str, part_name: str, effect_name: str, effect_item: LEDEffect
):
    led_map_update = state.led_map_updates

    for _, _, _, effect in led_map_update.added:
        if effect.id == effect_item.id:
            led_map_update.added.remove((model_name, part_name, effect_name, effect))
            led_map_update.added.append(
                (model_name, part_name, effect_name, effect_item)
            )
            return

    for _, _, _, effect in led_map_update.updated:
        if effect.id == effect_item.id:
            led_map_update.updated.remove((model_name, part_name, effect_name, effect))
            led_map_update.updated.append(
                (model_name, part_name, effect_name, effect_item)
            )
            return

    led_map_update.updated.append((model_name, part_name, effect_name, effect_item))

    state.led_map_pending.update = True
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def delete_led_effect(
    model_name: str, part_name: str, effect_name: str, effect_id: int
):
    led_map_update = state.led_map_updates

    for model, part, name, effect in led_map_update.added:
        if effect.id == effect_id:
            led_map_update.added.remove((model, part, name, effect))

            if len(led_map_update.added) == 0 or len(led_map_update.deleted) == 0:
                state.led_map_pending.add_or_delete = False

            return

    for model, part, name, effect in led_map_update.updated:
        if effect.id == effect_id:
            led_map_update.updated.remove((model, part, name, effect))

    led_map_update.deleted.append((model_name, part_name, effect_name, effect_id))

    # if state.edit_state == EditMode.EDITING:
    #     state.led_map_pending.add_or_delete = True
    #     redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    # else:
    #     apply_led_map_updates_add_or_delete()
    #     notify("INFO", f"Deleted color {effect_id}")

    if state.edit_state == EditMode.EDITING:
        remove_effect_in_editing_status(effect_id)

    apply_led_map_updates_add_or_delete()
    notify("INFO", f"Deleted color {effect_id}")


def apply_led_map_updates_add_or_delete():
    led_map_update = state.led_map_updates

    for model, part, name, effect in led_map_update.added:
        state.led_map[model][part][name] = effect
        state.led_effect_id_table[effect.id] = effect

    for model, part, name, effect_id in led_map_update.deleted:
        del state.led_map[model][part][name]
        del state.led_effect_id_table[effect_id]

    led_map_update.added.clear()
    led_map_update.deleted.clear()

    state.led_map_pending.add_or_delete = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def apply_led_map_updates_update():
    led_map_update = state.led_map_updates

    for model, part, name, effect in led_map_update.updated:
        state.led_map[model][part][name] = effect
        state.led_effect_id_table[effect.id] = effect

    init_ctrl_keyframes_from_state(effect_only=True)

    led_map_update.updated.clear()

    state.led_map_pending.update = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def remove_effect_in_editing_status(effect_id: LEDEffectID):
    for dancer in state.dancers_array:
        dancer_obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer.name)
        if dancer_obj is not None:
            part_objs: List[bpy.types.Object] = getattr(dancer_obj, "children")
            part_obj_names: List[str] = [
                getattr(obj, "ld_part_name") for obj in part_objs
            ]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]
                part_type = getattr(part_obj, "ld_light_type")

                if part_type == LightType.FIBER.value:
                    ld_effect_id: int = cast(int, part_obj["ld_effect"])
                    if ld_effect_id == effect_id:
                        part_obj["ld_effect"] = -1
