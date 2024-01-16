from ...states import state


def update_current_status_by_index(index: int):
    state.current_control_index = index

    control_map = state.control_map
    control_id = state.control_record[index]

    current_control_map = control_map.get(control_id)
    if current_control_map is None:
        return

    state.current_status = current_control_map.status
    current_status = state.current_status
    # print(f"Current control: {current_status}")

    # TODO: Update properties
