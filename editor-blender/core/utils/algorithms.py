from typing import Literal


def binary_search(arr: list[int], x: int) -> int:
    """
    :param arr: sorted list of integers
    :param x: integer to search for
    :return: index of the last number in arr that is less than or equal to x
    """
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] <= x:
            l = mid + 1
        else:
            r = mid - 1
    return r


def _binary_search_with_lr(
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
             or tuple of 'out of range' error: showing that the number is bigger/smaller than all num. in array
    """
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


def binary_search_for_range(arr: list[int], left: int, right: int) -> tuple[int, int]:
    """
    :param arr: sorted list of integers
    :param left, right: designated range
    :return: the smallest continuous range in arr that includes [left, right], which is in the form of indexes
    """
    search_l = _binary_search_with_lr(arr, left)[0]
    search_r = _binary_search_with_lr(arr, right)[1]

    if search_l == "OutOfRange_Larger":
        return (len(arr) - 1, len(arr) - 1)
    if search_r == "OutOfRange_Smaller":
        return (0, 0)
    if search_l == "OutOfRange_Smaller":
        search_l = 0
    if search_r == "OutOfRange_Larger":
        search_r = len(arr) - 1
    return (search_l, search_r)
