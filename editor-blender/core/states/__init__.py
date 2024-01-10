from ..models import EditingData, EditMode, Editor, State

state = State(
    is_running=False,
    is_logged_in=False,
    token="",
    control_map={},
    pos_map={},
    # TODO: Add these
    # led_map={},
    # led_effect_id_table={},
    current_control_index=0,
    current_pos_index=0,
    current_led_index=0,
    # NOTE: Maybe we don't need these
    # current_fade=False,
    # current_status={},
    # current_pos={},
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
    # NOTE: Guess we can't implement these
    # selection_mode: SelectMode.DANCER_MODE
    # TODO: Fill these
    part_type_map={},
    dancers_array=[],
)
