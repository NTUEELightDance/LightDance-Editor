from typing import List, Optional, Tuple

import bpy

from ....properties.types import RevisionPropertyType
from ...models import ControlMap, ControlMapElement, MapID, PosMap
from ...utils.convert import control_modify_to_animation_data
from .animation_data import (
    add_single_pos_keyframe,
    delete_single_pos_keyframe,
    edit_single_pos_keyframe,
    modify_partial_ctrl_keyframes,
    reset_ctrl_rev,
    update_control_frames_and_fade_sequence,
)


def update_rev_changes(
    incoming_pos_map: PosMap,
    incoming_control_map: ControlMap,
    dancers_reset: Optional[List[bool]] = None,
):
    # position
    ld_pos_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_pos_rev
    ]
    local_rev = list(dict.fromkeys(local_rev))

    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:  # delete
            print(f"[POS] deleting {frame_id}, {frame_start}")
            delete_single_pos_keyframe(frame_id, frame_start)

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data >= 0
                and meta >= 0
            ):
                # local animation data matches incoming
                print(f"[POS] editing {frame_id}, {incoming_pos_map[frame_id].start}")
                edit_single_pos_keyframe(
                    frame_id, incoming_pos_map[frame_id], frame_start
                )

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        print(f"[POS] adding {id}, {incoming_pos_map[id].start}")
        add_single_pos_keyframe(id, incoming_pos_map[id])

    # control
    ld_ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_ctrl_rev
    ]
    local_rev = list(dict.fromkeys(local_rev))

    incoming_rev = {id: element.rev for id, element in incoming_control_map.items()}

    # sorted by old start time
    control_update: List[Tuple[int, MapID, ControlMapElement]] = []
    # sorted by start time
    control_add: List[Tuple[MapID, ControlMapElement]] = []
    # sorted by start time
    control_delete: List[Tuple[int, MapID]] = []

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:
            print(f"[CTRL] delete {frame_id: 4d}, {frame_start}")
            control_delete.append((frame_start, frame_id))

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data >= 0
                and meta >= 0
            ):
                # local animation data matches incoming
                print(
                    f"[CTRL]   edit {frame_id: 4d}, {incoming_control_map[frame_id].start}"
                )
                control_update.append(
                    (frame_start, frame_id, incoming_control_map[frame_id])
                )

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        print(f"[CTRL]    add {id: 4d}, {incoming_control_map[id].start}")
        control_add.append((id, incoming_control_map[id]))

    control_update.sort(key=lambda x: x[0])
    control_add.sort(key=lambda x: x[1].start)
    control_delete.sort(key=lambda x: x[0])

    modify_animation_data = control_modify_to_animation_data(
        control_delete, control_update, control_add
    )
    modify_partial_ctrl_keyframes(modify_animation_data, dancers_reset)

    sorted_ctrl_map = sorted(
        incoming_control_map.items(), key=lambda item: item[1].start
    )
    fade_seq = [(frame.start, frame.fade) for _, frame in sorted_ctrl_map]

    delete_frames = [frame[0] for frame in control_delete]
    update_frames = [(frame[0], frame[2].start) for frame in control_update]
    add_frames = [frame[1].start for frame in control_add]
    update_control_frames_and_fade_sequence(
        delete_frames, update_frames, add_frames, fade_seq
    )
    print("Done reset control frames and fade sequence")

    reset_ctrl_rev(sorted_ctrl_map)
    print("Done reset control rev")
