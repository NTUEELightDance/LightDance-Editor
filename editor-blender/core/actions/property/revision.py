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
    ld_pos_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_pos_rev
    ]

    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:  # delete
            # print(f"deleting {frame_id}, {frame_start}")
            delete_single_pos_keyframe(frame_id, frame_start)

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data > 0
                and meta > 0
            ):
                # local animation data matches incoming
                # print(f"editing {frame_id}, {incoming_pos_map[frame_id].start}")
                edit_single_pos_keyframe(
                    frame_id, incoming_pos_map[frame_id], frame_start
                )

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        # print(f"adding {id}, {incoming_pos_map[id].start}")
        add_single_pos_keyframe(id, incoming_pos_map[id])

    # control
    ld_ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_ctrl_rev
    ]

    incoming_rev = {id: element.rev for id, element in incoming_control_map.items()}

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:
            # print(f"deleting {local_id}")
            delete_single_ctrl_keyframe(frame_id, frame_start)

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data > 0
                and meta > 0
            ):
                # local animation data matches incoming
                # print(f"editing {local_id}")
                edit_single_ctrl_keyframe(
                    frame_id, incoming_control_map[frame_id], frame_start
                )

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        # print(f"adding {id}")
        add_single_ctrl_keyframe(id, incoming_control_map[id])
