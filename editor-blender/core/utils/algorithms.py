from typing import List


def binary_search(arr: List[int], x: int) -> int:
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
