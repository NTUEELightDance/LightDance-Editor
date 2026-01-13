import math
from typing import Any, Generator, cast

from control_diff_state import (
    AddedFrameDiff,
    DeletedFrameDiff,
    UpdatedFrameDiff,
    state_control_diff,
    state_recorded_control_map,
)

from .....core.models import ControlMapElement_MODIFIED, ControlMapStatus_MODIFIED
from .....core.states import state


def record_control_map():
    state_recorded_control_map = state.control_map_MODIFIED


def _list_is_ended(index: int, ls: list[Any]):
    if index >= len(ls):
        return True
    return False


def _yield_zipped_sorted_map_by_time(
    ls1: list[ControlMapElement_MODIFIED], ls2: list[ControlMapElement_MODIFIED]
) -> Generator[
    tuple[int, ControlMapStatus_MODIFIED | None, ControlMapStatus_MODIFIED | None]
]:
    """
    Zip two sorted control map to a list of tuple, and return such list in a form of generator.

    Args:
        ls1: The first sorted ctrl map received.
        ls2: The second sorted ctrl map received.

    Returns:
        A generator that produce tuples, each with 3 elements. The first elements will be the start of the following maps, and the second and third elements will be the status from ls1(second)/ls2(third) of corresponding start, or None if such status with corresponding start does not exist. The result yields will be increasing in first element(or start), which can be seen as sorted in time.
    """
    ls1_index = 0
    ls1_len = len(ls1)
    _ls1_is_ended = lambda: ls1_index >= ls1_len

    ls2_index = 0
    ls2_len = len(ls2)
    _ls2_is_ended = lambda: ls2_index >= ls2_len

    while not (_ls1_is_ended() and _ls2_is_ended()):
        cur_ls1_item = ls1[ls1_index] if not _ls1_is_ended() else None
        cur_ls2_item = ls2[ls2_index] if not _ls2_is_ended() else None

        cur_ls1_start, cur_ls1_elem = math.inf, None
        if cur_ls1_item is not None:
            cur_ls1_start, cur_ls1_elem = cur_ls1_item.start, cur_ls1_item.status
        cur_ls2_start, cur_ls2_elem = math.inf, None
        if cur_ls2_item is not None:
            cur_ls2_start, cur_ls2_elem = cur_ls2_item.start, cur_ls2_item.status

        min_start = min(cur_ls1_start, cur_ls2_start)
        min_start = cast(int, min_start)

        zipped_elem = (min_start, cur_ls1_elem, cur_ls2_elem)
        yield zipped_elem

        if min_start == cur_ls1_start:
            ls1_index += 1
        if min_start == cur_ls2_start:
            ls2_index += 1


def _has_added_or_updated_color_or_effect():
    """
    Return True if the status contain added or updated color/effect, else return False.
    """
    pass


def _extract_update_diff(start, ctrl_map_status, recorded_ctrl_map_status):
    update_dict = {}
    for dancer in state.dancer_names:
        dancer_diff_dict = {}
        for part in state.dancers[dancer]:
            ctrl_map_data = ctrl_map_status[dancer][part]
            recorded_ctrl_map_data = recorded_ctrl_map_status[dancer][part]
            part_dict_diff = {}

            # if both of them is None: Skip it
            if recorded_ctrl_map_data is None and ctrl_map_data is None:
                continue

            # if either of them is None: Update
            if recorded_ctrl_map_data is None or ctrl_map_data is None:
                part_dict_diff = ctrl_map_data
                dancer_diff_dict[part] = part_dict_diff
                continue

            # else: check if they are different
            # TODO: finish this

        if dancer_diff_dict:
            update_dict[dancer] = dancer_diff_dict

    return start, update_dict


def calculate_control_diff():
    sorted_ctrl_map_elems = sorted(
        state.control_map_MODIFIED.values(), key=lambda item: item.start
    )
    sorted_recorded_ctrl_map_elems = sorted(
        state.control_map_MODIFIED.values(), key=lambda item: item.start
    )

    zipped_elems = _yield_zipped_sorted_map_by_time(
        sorted_ctrl_map_elems, sorted_recorded_ctrl_map_elems
    )

    for start, ctrl_map_status, recorded_ctrl_map_status in zipped_elems:
        # Only record map has status of such start: Add it
        if recorded_ctrl_map_status is None:
            ctrl_map_status = cast(ControlMapStatus_MODIFIED, ctrl_map_status)
            added_diff: AddedFrameDiff = start, ctrl_map_status
            state_control_diff.append(added_diff)
            continue

        # Only current map has status of such start: Delete it
        if ctrl_map_status is None:
            delete_diff: DeletedFrameDiff = start
            state_control_diff.append(delete_diff)
            continue

        # Else: Update the map
        ctrl_map_status = cast(ControlMapStatus_MODIFIED, ctrl_map_status)
        recorded_ctrl_map_status = cast(
            ControlMapStatus_MODIFIED, recorded_ctrl_map_status
        )
        update_diff: UpdatedFrameDiff = _extract_update_diff(
            start, ctrl_map_status, recorded_ctrl_map_status
        )

        if update_diff[1] is not None:
            state_control_diff.append(update_diff)
