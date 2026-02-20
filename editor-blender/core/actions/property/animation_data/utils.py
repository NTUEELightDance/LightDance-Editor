from typing import cast

import bpy


def ensure_action(
    obj: bpy.types.Object | bpy.types.Scene, action_name: str
) -> bpy.types.Action:
    anim_data = cast(bpy.types.AnimData | None, obj.animation_data)
    if anim_data is None:
        obj.animation_data_create()
        anim_data = obj.animation_data

    action = cast(bpy.types.Action | None, anim_data.action)
    if action is None:
        obj.animation_data.action = bpy.data.actions.new(action_name)
        action = obj.animation_data.action

    return action


def get_curve(
    action: bpy.types.Action,
    data_path: str,
    index: int = 0,
) -> bpy.types.FCurve | None:
    curves = action.fcurves
    curve = cast(bpy.types.FCurve | None, curves.find(data_path, index=index))
    return curve


def ensure_curve(
    action: bpy.types.Action,
    data_path: str,
    index: int = 0,
    keyframe_points: int = 0,
    clear: bool = False,
) -> bpy.types.FCurve:
    curves = action.fcurves
    curve = cast(bpy.types.FCurve | None, curves.find(data_path, index=index))

    if curve is None:
        curves.new(data_path, index=index)
        curve = curves.find(data_path, index=index)
        curve.keyframe_points.add(keyframe_points)

        return curve

    if clear:
        curve.keyframe_points.clear()
        curve.keyframe_points.add(keyframe_points)

    return curve


def ensure_or_expand_curve(
    action: bpy.types.Action,
    data_path: str,
    index: int = 0,
    clear: bool = False,
) -> bpy.types.FCurve:
    """
    If the curve exist, return the curve with one more empty slot
    Else, create a new curve with one slot
    """
    curves = action.fcurves
    curve = cast(bpy.types.FCurve | None, curves.find(data_path, index=index))

    if curve is None:
        curves.new(data_path, index=index)
        curve = curves.find(data_path, index=index)
        curve.keyframe_points.add(1)

        return curve

    if clear:
        curve.keyframe_points.clear()

    curve.keyframe_points.add(1)
    return curve


def ensure_collection(
    action: bpy.types.Action,
    collection_name: str,
    curve_names: list[str],
) -> None:
    if bpy.data.collections.get(collection_name) is None:
        collection = bpy.data.collections.new(collection_name)
        bpy.context.scene.collection.children.link(collection)

        for curve_name in curve_names:
            curve = ensure_curve(
                action=action,
                data_path=curve_name,
            )
            curve_obj = bpy.data.objects.new(curve_name, curve)
            collection.objects.link(curve_obj)


def delete_curve(
    action: bpy.types.Action,
    data_path: str,
    index: int = 0,
) -> None:
    curves = action.fcurves
    curve = curves.find(data_path, index=index)
    if curve is not None:
        curves.remove(curve)


def get_keyframe_points(
    curve: bpy.types.FCurve,
) -> tuple[bpy.types.FCurveKeyframePoints, list[bpy.types.Keyframe]]:
    return curve.keyframe_points, cast(list[bpy.types.Keyframe], curve.keyframe_points)
