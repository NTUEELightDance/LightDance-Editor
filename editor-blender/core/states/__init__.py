from ..models import (
    ColorMapUpdates,
    ControlMapUpdates,
    EditingData,
    EditMode,
    Editor,
    PosMapUpdates,
    State,
)

state = State(
    is_running=False,
    is_logged_in=False,
    is_playing=False,
    subscription_task=None,
    init_editor_task=None,
    token="",
    username="",
    ready=False,
    control_map={},
    pos_map={},
    control_record=[],
    pos_record=[],
    # TODO: Add these
    led_map={},
    led_effect_id_table={},
    current_control_index=0,
    current_pos_index=0,
    current_led_index=0,
    # NOTE: Maybe we don't need these
    current_fade=False,
    current_status={},
    current_pos={},
    # current_editing_frame=-1,
    current_editing_frame=0,
    current_editing_detached=False,
    current_editing_frame_synced=True,
    # NOTE: Guess we can't implement these
    # status_stack=[],
    # status_stack_index=0,
    # pos_stack=[],
    # pos_stack_index=0,
    # TODO: Add these
    # led_effect_record={},
    # current_led_status={}
    edit_state=EditMode.IDLE,
    editor=Editor.CONTROL_EDITOR,
    editing_data=EditingData(frame_id=-1, start=0, index=0),
    shifting=False,
    # NOTE: Guess we can't implement these
    # selection_mode: SelectMode.DANCER_MODE
    # selected={},
    selected_obj_names=[],
    selected_obj_type=None,
    # selected_leds,
    # current_led_effect_reference_dancer
    # current_led_partName
    # current_led_effect_name
    # current_led_effect_start
    # current_led_effect
    dancers={},
    dancer_names=[],
    part_type_map={},
    led_part_length_map={},
    color_map={},
    # effect_list
    dancers_array=[],
    dancer_part_index_map={},
    # rpi_status
    # shell_history
    color_map_updates=ColorMapUpdates(added=[], updated=[], deleted=[]),
    color_map_pending=False,
    control_map_updates=ControlMapUpdates(added=[], updated=[], deleted=[]),
    control_map_pending=False,
    pos_map_updates=PosMapUpdates(added=[], updated=[], deleted=[]),
    pos_map_pending=False,
)
