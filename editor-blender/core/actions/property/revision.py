import bpy

from ....properties.types import RevisionPropertyType
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
    local_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}

    # print({id: frame.start for id, frame in incoming_pos_map.items()})

    for rev in local_rev:
        local_id: MapID = rev.frame_id

        incoming_rev_item = incoming_rev.get(local_id)
        if incoming_rev_item is None:  # delete
            # print(f"deleting {local_id}")
            delete_single_pos_keyframe(local_id, rev.frame_start)

        else:
            if not (
                incoming_rev_item.data == rev.data
                and incoming_rev_item.meta == rev.meta
                and rev.data > 0
                and rev.meta > 0
            ):  # local animation data matches incoming
                # print(f"editing {local_id}")
                edit_single_pos_keyframe(
                    local_id, incoming_pos_map[rev.frame_id], rev.frame_start
                )

            del incoming_rev[local_id]

    for id in incoming_rev.keys():
        # print(f"adding {id}")
        add_single_pos_keyframe(id, incoming_pos_map[id])

    # control
    local_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    incoming_rev = {id: element.rev for id, element in incoming_control_map.items()}

    for rev in local_rev:
        local_id: MapID = rev.frame_id

        incoming_rev_item = incoming_rev.get(local_id)
        if incoming_rev_item is None:
            delete_single_ctrl_keyframe(local_id, rev.frame_start)

        else:
            if not (
                incoming_rev_item.data == rev.data
                and incoming_rev_item.meta == rev.meta
                and rev.data > 0
                and rev.meta > 0
            ):  # local animation data matches incoming
                edit_single_ctrl_keyframe(
                    local_id, incoming_control_map[rev.frame_id], rev.frame_start
                )

            del incoming_rev[local_id]

    for id in incoming_rev.keys():
        add_single_ctrl_keyframe(id, incoming_control_map[id])
