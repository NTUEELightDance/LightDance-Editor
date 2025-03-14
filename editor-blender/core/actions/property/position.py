import bpy

from ....properties.types import PositionPropertyType
from ...models import EditMode
from ...states import state

# def continuous_update_current_position(
#     self: bpy.types.PropertyGroup, context: bpy.types.Context
# ):
#     if state.edit_state != EditMode.EDITING or state.current_editing_detached:
#         return
#
#     obj = context.object
#     ld_position: PositionPropertyType = getattr(obj, "ld_position")
#
#     obj.location = ld_position.location
#     obj.rotation_euler = ld_position.rotation
#
#
# # TODO: Push stack
# def update_current_position(self: bpy.types.PropertyGroup, context: bpy.types.Context):
#     if state.edit_state != EditMode.EDITING:
#         return
#
#     print("Updating current position in state")


def update_current_position(self: bpy.types.PropertyGroup, context: bpy.types.Context):
    if state.edit_state != EditMode.EDITING or state.current_editing_detached:
        return

    obj: bpy.types.Object = self.id_data  # type: ignore
    ld_position: PositionPropertyType = getattr(obj, "ld_position")
    print("Updating current position in state from property")

    obj.location = ld_position.location
    obj.rotation_euler = ld_position.rotation
