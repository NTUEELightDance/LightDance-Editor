from ....actions.property.revision import update_rev_changes
from ....states import state
from ...property.animation_data import (
    init_ctrl_keyframes_from_state,
    init_pos_keyframes_from_state,
)


def setup_animation_data():
    dancers_reset_animation = state.init_temps.dancers_reset_animation
    reset_all = all(dancers_reset_animation)
    update_all = not any(dancers_reset_animation)

    if reset_all:
        init_ctrl_keyframes_from_state()
        init_pos_keyframes_from_state()
        return

    if update_all:
        update_rev_changes(state.pos_map, state.control_map)
        return

    init_ctrl_keyframes_from_state(dancers_reset_animation)
    init_pos_keyframes_from_state(dancers_reset_animation)
    update_rev_changes(state.pos_map, state.control_map, dancers_reset_animation)
