import bpy

from ....core.actions.state.dopesheet import (
    init_fade_seq_from_state,
    init_pos_seq_from_state,
)
from ....core.states import state
from ....properties.types import RevisionPropertyType
from ...log import logger
from ...models import ControlMap, ControlMapElement, MapID, PosMap, PosMapElement
from ...utils.convert import (
    control_modify_to_animation_data,
    pos_modify_to_animation_data,
)
from .animation_data import (
    modify_partial_ctrl_keyframes,
    modify_partial_pos_keyframes,
    reset_ctrl_rev,
    reset_pos_rev,
)


def update_rev_changes(
    incoming_pos_map: PosMap,
    incoming_control_map: ControlMap,
    dancers_reset: list[bool] | None = None,
):
    if not bpy.context:
        return
    # position

    ld_pos_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_pos_rev
    ]
    local_rev = list(dict.fromkeys(local_rev))

    incoming_rev = {id: element.rev for id, element in incoming_pos_map.items()}

    # sorted by old start time
    pos_update: list[tuple[int, MapID, PosMapElement]] = []
    # sorted by start time
    pos_add: list[tuple[MapID, PosMapElement]] = []
    # sorted by start time
    pos_delete: list[tuple[int, MapID]] = []

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:  # delete
            logger.info(f"[POS] deleting {frame_id}, {frame_start}")
            pos_delete.append((frame_start, frame_id))

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data >= 0
                and meta >= 0
            ):
                # local animation data matches incoming
                logger.info(
                    f"[POS] editing {frame_id}, {incoming_pos_map[frame_id].start}"
                )
                pos_update.append((frame_start, frame_id, incoming_pos_map[frame_id]))

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        logger.info(f"[POS] adding {id}, {incoming_pos_map[id].start}")
        pos_add.append((id, incoming_pos_map[id]))

    pos_update.sort(key=lambda x: x[0])
    pos_add.sort(key=lambda x: x[1].start)
    pos_delete.sort(key=lambda x: x[0])

    modify_animation_data = pos_modify_to_animation_data(
        pos_delete, pos_update, pos_add
    )
    modify_partial_pos_keyframes(modify_animation_data)

    sorted_pos_map = sorted(incoming_pos_map.items(), key=lambda item: item[1].start)

    init_pos_seq_from_state()
    logger.info("Done reset pos frames")

    reset_pos_rev(sorted_pos_map)
    logger.info("Done reset pos rev")

    # TODO: Finish control part
    # control
    ld_ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    local_rev = [
        (rev.frame_id, rev.frame_start, rev.meta, rev.data) for rev in ld_ctrl_rev
    ]
    local_rev = list(dict.fromkeys(local_rev))

    incoming_rev = {id: element.rev for id, element in incoming_control_map.items()}

    # sorted by old start time
    control_update: list[tuple[int, MapID, ControlMapElement]] = []
    # sorted by start time
    control_add: list[tuple[MapID, ControlMapElement]] = []
    # sorted by start time
    control_delete: list[tuple[int, MapID]] = []

    for frame_id, frame_start, meta, data in local_rev:
        incoming_rev_item = incoming_rev.get(frame_id)
        if incoming_rev_item is None:
            logger.info(f"[CTRL] delete {frame_id: 4d}, {frame_start}")
            control_delete.append((frame_start, frame_id))

        else:
            if not (
                incoming_rev_item.data == data
                and incoming_rev_item.meta == meta
                and data >= 0
                and meta >= 0
            ):
                # local animation data matches incoming
                logger.info(
                    f"[CTRL] edit {frame_id: 4d}, {incoming_control_map[frame_id].start}"
                )
                control_update.append(
                    (frame_start, frame_id, incoming_control_map[frame_id])
                )

            del incoming_rev[frame_id]

    for id in incoming_rev.keys():
        logger.info(f"[CTRL] add {id: 4d}, {incoming_control_map[id].start}")
        control_add.append((id, incoming_control_map[id]))

    control_update.sort(key=lambda x: x[0])
    control_add.sort(key=lambda x: x[1].start)
    control_delete.sort(key=lambda x: x[0])

    modify_animation_data, no_change_dict = control_modify_to_animation_data(
        control_delete, control_update, control_add
    )
    modify_partial_ctrl_keyframes(modify_animation_data, no_change_dict, dancers_reset)

    sorted_ctrl_map = sorted(
        incoming_control_map.items(), key=lambda item: item[1].start
    )

    init_fade_seq_from_state()
    logger.info("Done reset control frames and fade sequence")

    reset_ctrl_rev(sorted_ctrl_map)
    logger.info("Done reset control rev")
