from ...models import LEDMap
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area


def set_led_map(led_map: LEDMap):
    state.led_map = led_map
    state.led_effect_id_table = {}

    for part_effects in led_map.values():
        for effect in part_effects.values():
            state.led_effect_id_table[effect.id] = effect

    # TODO: Setup LED Effect List
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
