# This file is for development use only, and will be incorporate into core/models after finishing development.

from enum import IntEnum, auto

from .....core.models import ControlMap_MODIFIED, ControlMapStatus_MODIFIED

DancerID = int
PartID = int
StartTime = int
EndTime = int
ShiftedTime = int
Time = int

AddedFrameDiff = tuple[Time, ControlMapStatus_MODIFIED]
UpdatedFrameDiff = tuple[Time, ControlMapStatus_MODIFIED]
DeletedFrameDiff = Time
ShiftedTimeDiff = tuple[StartTime, EndTime, ShiftedTime]

ControlDiff = AddedFrameDiff | UpdatedFrameDiff | DeletedFrameDiff | ShiftedTimeDiff

state_recorded_control_map: ControlMap_MODIFIED = []
state_control_diff: list[ControlDiff] = []
state_added_or_updated_effect = []
state_added_or_updated_color = []
