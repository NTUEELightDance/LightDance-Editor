from ..models import (
    Clipboard,
    ColorMapPending,
    ColorMapUpdates,
    ControlMapUpdates,
    CopiedType,
    EditingData,
    EditMode,
    Editor,
    InitializationTemporaries,
    LEDMapPending,
    LEDMapUpdates,
    PosMapUpdates,
    Preferences,
    SelectMode,
    State,
)

state = State(
    running=False,
    sync=False,
    user_log="Loading...",
    preferences=Preferences(
        auto_sync=True,
        follow_frame=True,
        show_waveform=True,
        show_beat=True,
        show_nametag=True,
    ),
    logged_in=False,
    loading=False,
    partial_load_frames=(0, 1),
    playing=False,
    requesting=False,
    subscription_task=None,
    init_editor_task=None,
    command_task=None,
    init_temps=InitializationTemporaries(
        assets_load={},
        dancer_models_hash={},
        dancer_model_update={},
        dancers_object_exist={},
        dancers_reset_animation=[],
    ),
    music_frame_length=0,
    token="",
    username="",
    ready=False,
    control_map={},
    pos_map={},
    not_loaded_control_frames=[],
    not_loaded_pos_frames=[],
    control_record=[],
    control_start_record=[],
    pos_record=[],
    pos_start_record=[],
    led_map={},
    led_effect_id_table={},
    current_control_index=0,
    current_pos_index=0,
    current_led_index=0,
    current_fade=False,
    current_status={},
    current_led_status={},
    current_pos={},
    current_editing_frame=0,
    current_editing_detached=False,
    current_editing_frame_synced=True,
    edit_state=EditMode.IDLE,
    editor=Editor.CONTROL_EDITOR,
    local_view=False,
    editing_data=EditingData(frame_id=-1, start=0, index=0),
    shifting=False,
    selection_mode=SelectMode.PART_MODE,
    selected_obj_names=[],
    selected_obj_type=None,
    clipboard=Clipboard(CopiedType.NONE),
    models={},
    model_names=[],
    models_array=[],
    model_dancer_index_map={},
    dancers={},
    dancer_names=[],
    dancers_array=[],
    show_dancers=[],
    dancer_load_frames=(0, 0),
    dancer_part_index_map={},
    part_type_map={},
    led_part_length_map={},
    color_map={},
    rpi_status={},
    shell_history={},
    last_play_timestamp_ms=0,
    color_map_updates=ColorMapUpdates(added=[], updated=[], deleted=[]),
    color_map_pending=ColorMapPending(add_or_delete=False, update=False),
    led_map_updates=LEDMapUpdates(added=[], updated=[], deleted=[]),
    led_map_pending=LEDMapPending(add_or_delete=False, update=False),
    control_map_updates=ControlMapUpdates(added={}, updated={}, deleted={}),
    control_map_pending=False,
    pos_map_updates=PosMapUpdates(added={}, updated={}, deleted={}),
    pos_map_pending=False,
    dancer_part_objects_map={},
    music_beats=[],
    scene_start_point=[],
)
