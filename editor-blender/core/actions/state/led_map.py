from ...models import LEDEffect, LEDMap
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import set_ctrl_keyframes_from_state


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
    led_map = state.led_map
    led_map[model_name][part_name][effect_name] = effect_item
    set_led_map(led_map)


def edit_led_effect(
    model_name: str, part_name: str, effect_name: str, effect_item: LEDEffect
):
    led_map = state.led_map
    edited_name = next(
        name
        for name, effect in led_map[model_name][part_name].items()
        if effect.id == effect_item.id
    )
    if effect_name == edited_name:
        led_map[model_name][part_name][edited_name] = effect_item
    else:
        del led_map[model_name][part_name][edited_name]
        led_map[model_name][part_name][effect_name] = effect_item
    state.led_map_pending = True
    set_led_map(led_map)


def delete_led_effect(model_name: str, part_name: str, effect_id: int):
    led_map = state.led_map
    delete_name = next(
        name
        for name, effect in led_map[model_name][part_name].items()
        if effect.id == effect_id
    )
    del led_map[model_name][part_name][delete_name]
    set_led_map(led_map)


def apply_led_map_updates():
    set_ctrl_keyframes_from_state(effect_only=True)
    state.led_map_pending = False
