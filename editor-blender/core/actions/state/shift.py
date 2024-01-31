import bpy

from ....api.time_shift_agent import time_shift_agent
from ....properties.ui.types import TimeShiftStatusType
from ...models import FrameType
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area


def toggle_shift():
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    ld_ui_time_shift["start"] = bpy.context.scene.frame_current  # type: ignore
    ld_ui_time_shift["end"] = bpy.context.scene.frame_current  # type: ignore
    ld_ui_time_shift["displacement"] = 0  # type: ignore

    state.shifting = True
    redraw_area("VIEW_3D")


def cancel_shift():
    state.shifting = False
    redraw_area("VIEW_3D")


async def confirm_shift():
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    frame_type = FrameType(ld_ui_time_shift.frame_type)
    start = ld_ui_time_shift.start
    end = ld_ui_time_shift.end
    displacement = ld_ui_time_shift.displacement

    try:
        retult = await time_shift_agent.shfit(
            frame_type=frame_type, interval=(start, end), displacement=displacement
        )
        if not retult.ok:
            raise Exception(retult.msg)

        state.shifting = False
        redraw_area("VIEW_3D")
        notify("Time shift success")

    except Exception as e:
        state.shifting = False
        redraw_area("VIEW_3D")
        notify(f"Time shift failed: {e}")