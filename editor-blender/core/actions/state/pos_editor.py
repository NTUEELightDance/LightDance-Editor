import asyncio
from typing import Optional

import bpy

from ....properties.types import PositionPropertyType
from ...asyncio import AsyncTask
from ...states import state


# Move back to editing frame and sync properties
def attach_editing_pos_frame():
    current_frame = state.current_editing_frame

    bpy.context.scene.frame_current = current_frame
    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    sync_editing_pos_frame_properties()


def sync_editing_pos_frame_properties():
    print("Syncing")

    async def defer():
        await asyncio.sleep(0.01)

        for dancer_name in state.dancer_names:
            # print(f"Syncing {dancer_name} to editing frame")
            obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")

                # Wait for animation update to finish
                # Or the location will be reset to the original value
                # print(f"Update {dancer_name} to {ld_position.transform}")
                obj.location = ld_position.transform
                obj.rotation_euler = ld_position.rotation

    AsyncTask(defer).exec()
