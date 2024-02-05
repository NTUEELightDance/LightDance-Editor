from typing import List

import bpy

from ....properties.revision import KeyframeRevisionItem
from ...models import ControlMap, MapID, PosMap
from .animation_data import (
    add_single_ctrl_keyframe,
    add_single_pos_keyframe,
    delete_single_ctrl_keyframe,
    delete_single_pos_keyframe,
    edit_single_ctrl_keyframe,
    edit_single_pos_keyframe,
)


def update_rev_changes(incoming_pos_map: PosMap, incoming_control_map: ControlMap):
    # position
    local_rev: List[KeyframeRevisionItem] = getattr(bpy.context.scene, "ld_pos_rev")
    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}
    for rev in local_rev:
        local_id: MapID = rev.frame_id
        if local_id not in incoming_rev.keys():  # delete
            delete_single_pos_keyframe(local_id, rev.frame_start)
            del incoming_rev[local_id]
        else:
            incoming_rev_item = incoming_rev[local_id]
            if incoming_rev_item:
                if (
                    incoming_rev_item.data == rev.data
                    and incoming_rev_item.meta == rev.meta
                    and rev.data > 0
                    and rev.meta > 0
                ):  # local animation data matches incoming
                    continue
                else:
                    edit_single_pos_keyframe(local_id, incoming_pos_map[rev.frame_id])
            del incoming_rev[local_id]
    for id in incoming_rev.keys():
        add_single_pos_keyframe(id, incoming_pos_map[id])
    # control
    local_rev: List[KeyframeRevisionItem] = getattr(bpy.context.scene, "ld_ctrl_rev")
    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}
    for rev in local_rev:
        local_id: MapID = rev.frame_id
        if local_id not in incoming_rev.keys():  # delete
            delete_single_ctrl_keyframe(local_id, rev.frame_start)
            del incoming_rev[local_id]
        else:
            incoming_rev_item = incoming_rev[local_id]
            if incoming_rev_item:
                if (
                    incoming_rev_item.data == rev.data
                    and incoming_rev_item.meta == rev.meta
                    and rev.data > 0
                    and rev.meta > 0
                ):  # local animation data matches incoming
                    continue
                else:
                    edit_single_ctrl_keyframe(
                        local_id, incoming_control_map[rev.frame_id]
                    )
            del incoming_rev[local_id]
    for id in incoming_rev.keys():
        add_single_ctrl_keyframe(id, incoming_control_map[id])
