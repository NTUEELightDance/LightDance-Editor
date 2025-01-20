import traceback

import bpy

from ....api.time_shift_agent import time_shift_agent
from ....properties.ui.types import TimeShiftStatusType
from ...models import FrameType
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .app_state import set_requesting, set_shifting


def toggle_shift():
    if not bpy.context:
        return
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    ld_ui_time_shift["start"] = bpy.context.scene.frame_current  # type: ignore
    ld_ui_time_shift["end"] = bpy.context.scene.frame_current  # type: ignore
    ld_ui_time_shift["displacement"] = 0  # type: ignore

    set_shifting(True)
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def cancel_shift():
    set_shifting(False)
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


async def confirm_shift():
    if not bpy.context:
        return
    ld_ui_time_shift: TimeShiftStatusType = getattr(
        bpy.context.window_manager, "ld_ui_time_shift"
    )

    frame_type = FrameType(ld_ui_time_shift.frame_type)
    start = ld_ui_time_shift.start
    end = ld_ui_time_shift.end
    displacement = ld_ui_time_shift.displacement

    try:
        set_requesting(True)
        retult = await time_shift_agent.shift(
            frame_type=frame_type, interval=(start, end), displacement=displacement
        )
        set_requesting(False)

        if not retult.ok:
            raise Exception(retult.msg)

        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        notify("INFO", "Time shift success")

    except Exception as e:
        traceback.print_exc()
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        notify("ERROR", f"Time shift failed: {e}")

    set_shifting(False)
