import bpy

from ....core.actions.property.animation_data.utils import (  # ensure_collection,; delete_curve,
    ensure_action,
    ensure_curve,
    get_keyframe_points,
)
from ....core.states import state
from ....core.utils.notification import notify
from ....core.utils.ui import set_dopesheet_filter, set_multiple_dopesheet_filter

ctrl_test_frame = "ld_control_first_part_frame"
pos_test_frame = "ld_pos_first_dancer_frame"


def renew_pos_test_frame():
    first_dancer = state.dancer_names[0]
    total_effective_pos_frame_number = 0
    for _, pos_map_element in state.pos_map_MODIFIED.items():
        if pos_map_element.pos[first_dancer] is not None:
            total_effective_pos_frame_number += 1

    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")
    curve = ensure_curve(
        action,
        pos_test_frame,
        keyframe_points=total_effective_pos_frame_number,
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)

    effective_i = 0
    for _, pos_map_element in state.pos_map_MODIFIED.items():
        if total_effective_pos_frame_number == 0:
            break

        frame_start = pos_map_element.start
        pos_status = pos_map_element.pos

        if pos_status[first_dancer] is not None:
            # insert fake frame
            point = kpoints_list[effective_i]
            point.co = frame_start, frame_start
            point.interpolation = "CONSTANT"

            point.select_control_point = False

            effective_i += 1


def renew_ctrl_test_frame():
    if not bpy.context:
        return

    # global ctrl_test_frame

    # index = numpy.random.randint(0, len(state.dancer_names))
    first_dancer = state.dancer_names[0]
    first_part = state.dancers[first_dancer][0]

    sorted_ctrl_map = sorted(
        state.control_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    fade_seq = [
        (frame.start, frame.status[first_dancer][first_part].fade)  # type:ignore
        for _, frame in sorted_ctrl_map
        if frame.status[first_dancer][first_part] is not None
    ]
    total_effective_ctrl_frame_number = len(fade_seq)

    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")

    # delete_curve(action, ctrl_test_frame)

    # ctrl_test_frame = "ld_control_first_part_frame_" + str(index)
    curve = ensure_curve(
        action,
        ctrl_test_frame,
        keyframe_points=total_effective_ctrl_frame_number,
        clear=True,
    )
    _, kpoints_list = get_keyframe_points(curve)

    for i, (start, _) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        point.interpolation = "CONSTANT"
        point.select_control_point = False


def set_ctrl_test_frame():
    renew_ctrl_test_frame()
    set_dopesheet_filter(ctrl_test_frame)

    # action = ensure_action(bpy.context.scene, "SceneAction")
    # ensure_collection(action, "Ctrl_Pos_Test_Collection", [ctrl_test_frame, pos_test_frame])
    # set_multiple_dopesheet_filter("Ctrl_Pos_Test_Collection")

    # keywords = [ctrl_test_frame, pos_test_frame]
    # action = ensure_action(bpy.context.scene, "SceneAction")

    # # 1. Select F-Curves that match any of our keywords
    # for fcurve in action.fcurves:
    #     # Check if any keyword is in the data_path (e.g., 'location' or 'rotation')
    #     if any(key in fcurve.data_path for key in keywords):
    #         # notify("INFO", f"Selecting F-Curve: {fcurve.data_path}")
    #         fcurve.select = True
    #     else:
    #         fcurve.hide = True
    #         fcurve.select = False

    # # 2. Tell the Dope Sheet to only show selected channels
    # for area in bpy.context.screen.areas:
    #     if area.type == 'DOPESHEET_EDITOR':
    #         dopesheet = area.spaces.active.dopesheet
    #         dopesheet.filter_text = "ld"
    #         dopesheet.show_only_selected = True


def set_pos_test_frame():
    set_dopesheet_filter(pos_test_frame)
