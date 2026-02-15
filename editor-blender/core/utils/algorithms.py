from typing import Literal, cast

from ...core.models import ControlMapElement_MODIFIED, LEDData, MapID, PosMapElement


def binary_search(arr: list[int], x: int) -> int:
    """
    :param arr: sorted list of integers
    :param x: integer to search for
    :return: index of the last number in arr that is less than or equal to x
    """
    if len(arr) == 0:
        return -1

    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] <= x:
            l = mid + 1
        else:
            r = mid - 1
    return r


def binary_search_for_neighbors(
    arr: list[int], x: int
) -> (
    tuple[int, int]
    | tuple[
        Literal["OutOfRange_Larger", "OutOfRange_Smaller"],
        Literal["OutOfRange_Larger", "OutOfRange_Smaller"],
    ]
):
    """
    :param arr: sorted list of integers
    :param x: integer to search for
    :return: (index of the last number in arr that is less than or equal to x,
              index of the first number in arr that is larger than or equal to x)
             or tuple of 'out of range' error: showing that the number is bigger/smaller than all numbers in array
    """
    if len(arr) == 0:
        # empty array: treat as smaller-than-all for left, larger-than-all for right
        return ("OutOfRange_Smaller", "OutOfRange_Larger")

    l, r = 0, len(arr) - 1
    if x > arr[r]:
        return ("OutOfRange_Larger", "OutOfRange_Larger")
    elif x < arr[l]:
        return ("OutOfRange_Smaller", "OutOfRange_Smaller")
    while r - l > 1 or len(arr) == 2:
        mid = (r + l) // 2
        if arr[mid] < x:
            l = mid
        elif arr[mid] > x:
            r = mid
        else:
            l = mid
            r = mid
            break
        if len(arr) == 2:
            break
    return (l, r)


def smallest_range_including_lr(
    arr: list[int], left: int, right: int
) -> tuple[int, int]:
    """
    :param arr: sorted list of integers
    :param left: designated range of left
    :param right: designated range of right
    :return: the smallest continuous range in arr that includes [left, right], which is in the form of indexes
    """
    search_l = binary_search_for_neighbors(arr, left)[0]
    search_r = binary_search_for_neighbors(arr, right)[1]

    if search_l == "OutOfRange_Larger":
        return (len(arr) - 1, len(arr) - 1)
    if search_r == "OutOfRange_Smaller":
        return (0, 0)
    if search_l == "OutOfRange_Smaller":
        search_l = 0
    if search_r == "OutOfRange_Larger":
        search_r = len(arr) - 1
    return (search_l, search_r)


def expanded_filtered_map_bound(
    l_timerange: int,
    r_timerange: int,
    init_start_index: int,
    init_closed_end_index: int,
    sorted_map: list[tuple[MapID, ControlMapElement_MODIFIED]]
    | list[tuple[MapID, PosMapElement]],
    dancer_name: str,
    part_name: str | None = None,
) -> tuple[int, int]:
    """
    The code below filters the smallest range in a sort_map that satisfies the 3 following conditions, if possible:
    1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
    2. The borders' frame.start aren't state.dancer_load_frames[0] or state.dancer_load_frames[1]
    3. The status of the borders' frames aren't None

    if no sorted_map, return -1, -1
    """

    if not sorted_map:
        return (-1, -1)

    start_index = init_start_index
    end_index = init_closed_end_index

    def has_status_and_not_no_change(
        frame: ControlMapElement_MODIFIED | PosMapElement,
    ) -> bool:
        if part_name is not None:
            frame = cast(ControlMapElement_MODIFIED, frame)
            dancer_status = frame.status[dancer_name]
            if dancer_status[part_name] is None:
                return False
            elif (
                isinstance(dancer_status[part_name].part_data, LEDData)
                and dancer_status[part_name].part_data.effect_id  # type: ignore
                == -1  # type: ignore
            ):
                return False
            else:
                return True
        else:
            frame = cast(PosMapElement, frame)
            return frame.pos[dancer_name] is not None

    def has_status(frame: ControlMapElement_MODIFIED | PosMapElement) -> bool:
        if part_name is not None:
            frame = cast(ControlMapElement_MODIFIED, frame)
            dancer_status = frame.status[dancer_name]
            return dancer_status[part_name] is not None
        else:
            frame = cast(PosMapElement, frame)
            return frame.pos[dancer_name] is not None

    while True:
        if start_index == 0 or (
            sorted_map[init_start_index][1].start != l_timerange
            and has_status_and_not_no_change(sorted_map[start_index][1])
        ):
            break
        start_index -= 1

        if has_status_and_not_no_change(sorted_map[start_index][1]):
            break

    while True:
        if end_index == len(sorted_map) - 1 or (
            sorted_map[init_closed_end_index][1].start != r_timerange
            and has_status(sorted_map[start_index][1])
        ):
            break

        end_index += 1

        if has_status(sorted_map[end_index][1]):
            break

    return start_index, end_index


def largest_range_in_lr(arr: list[int], left: int, right: int) -> tuple[int, int]:
    """
    :param arr: sorted list of integers
    :param left, right: designated range
    :return: the largest continuous range in arr that are in [left, right], which is in the form of indexes
    """
    search_l = binary_search_for_neighbors(arr, left)[1]
    search_r = binary_search_for_neighbors(arr, right)[0]

    if search_l == "OutOfRange_Larger":
        return (len(arr) - 1, len(arr) - 1)
    if search_r == "OutOfRange_Smaller":
        return (0, 0)
    if search_l == "OutOfRange_Smaller":
        search_l = 0
    if search_r == "OutOfRange_Larger":
        search_r = len(arr) - 1
    return (search_l, search_r)


def linear_interpolation(lval: float, ldist: int, rval: float, rdist: int):
    if ldist == 0 and rdist == 0:
        return lval
    else:
        return (lval * float(rdist) + rval * float(ldist)) / float(ldist + rdist)
