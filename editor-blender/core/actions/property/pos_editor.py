import bpy

from ....properties.types import PositionPropertyType
from ...models import EditMode
from ...states import state


def update_multi_select_delta_transform(
    self: bpy.types.Object, context: bpy.types.Context
):
    if state.edit_state != EditMode.EDITING:
        return

    multi_select: bool = getattr(self, "multi_select")
    if not multi_select:
        return

    delta_transform: tuple[float, float, float] = getattr(
        self, "multi_select_delta_transform"
    )
    delta_transform_ref: tuple[float, float, float] = getattr(
        self, "multi_select_delta_transform_ref"
    )
    delta = (
        delta_transform[0] - delta_transform_ref[0],
        delta_transform[1] - delta_transform_ref[1],
        delta_transform[2] - delta_transform_ref[2],
    )
    for obj_name in state.selected_obj_names:
        obj: bpy.types.Object | None = bpy.data.objects.get(obj_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            ld_position.location = (
                delta[0] + ld_position.location[0],
                delta[1] + ld_position.location[1],
                delta[2] + ld_position.location[2],
            )

    setattr(self, "multi_select_delta_transform_ref", delta_transform)
