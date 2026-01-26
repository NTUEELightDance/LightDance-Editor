import sys
from copy import deepcopy
from enum import Enum
from typing import Literal, cast

from ....core.models import (
    RGB,
    RGBA,
    ControlMap_MODIFIED,
    ControlMapElement,
    ControlMapElement_MODIFIED,
    ControlMapStatus_MODIFIED,
    CtrlData,
    DancerName,
    FiberData,
    LEDBulbData,
    LEDData,
    Location,
    MapID,
    PartName,
    Position,
    PosMap,
    Rotation,
    Time,
)
from ....core.states import state

CtrlHistory = list[tuple[MapID, Time, CtrlData]]
FrameData = tuple[MapID, Time]


class PartType(Enum):
    Fiber = 0
    LED = 1


def _rough_conv_control_status_to_old(
    old_control_map_element: ControlMapElement, fade: bool
) -> ControlMapStatus_MODIFIED:
    """
    One-to-one transform, do not convert stat to None.
    """
    control_map_status = {}
    for dancer, part_list in state.dancers.items():
        dancer_map = {}
        for part in part_list:
            part_data = old_control_map_element.status[dancer][part]
            bulb_data = old_control_map_element.led_status[dancer][part]
            dancer_map[part] = CtrlData(
                part_data=part_data, bulb_data=bulb_data, fade=fade
            )
        control_map_status[dancer] = dancer_map
    return control_map_status


def _rough_conv_control_map_from_old():
    """
    One-to-one transform, do not convert stat to None.
    """
    state.control_map_MODIFIED = {}
    deepcopy_control_map_items = deepcopy(state.control_map).items()
    for mapID, control_map_element in deepcopy_control_map_items:
        control_map_status = _rough_conv_control_status_to_old(
            control_map_element, control_map_element.fade
        )
        control_map_element_status = ControlMapElement_MODIFIED(
            start=control_map_element.start,
            fade_for_new_status=False,
            rev=control_map_element.rev,
            status=control_map_status,
        )
        state.control_map_MODIFIED[mapID] = control_map_element_status


# Override state.control_map_MODIFIED to state.control_map
def sync_new_ctrl_map_from_old():
    # _rough_conv_control_map_from_old()
    pass


# Override state.pos_map_MODIFIED to state.pos_map
def sync_new_pos_map_from_old():
    # state.pos_map_MODIFIED = deepcopy(state.pos_map)
    from ....core.utils.for_dev_only.insert_map import load_default_map

    load_default_map()
