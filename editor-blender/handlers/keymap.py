from typing import Dict, List, Optional, cast

import bpy

default_clipboard_keymaps = ["view3d.copybuffer", "view3d.pastebuffer"]
default_delete_keymaps = {
    "Object Mode": ["object.delete", "anim.keyframe_delete_v3d"],
    "Dopesheet": ["action.delete"],
    "Outliner": ["outliner.delete", "anim.keyframe_delete"],
    "User Interface": ["anim.keyframe_delete_button"],
}


def check_keymaps_exist(
    keymaps: List[bpy.types.KeyMapItem],
    names: List[str],
    ctrl: List[int],
    oskey: List[int],
) -> List[Optional[bpy.types.KeyMapItem]]:
    wm = bpy.context.window_manager
    kc_items = cast(Dict[str, bpy.types.KeyMap], wm.keyconfigs.default.keymaps)[
        "3D View"
    ].keymap_items
    kc_items = cast(List[bpy.types.KeyMapItem], kc_items)

    results: List[Optional[bpy.types.KeyMapItem]] = [None] * len(names)

    for keymap in keymaps:
        for i in range(len(names)):
            if (
                keymap.idname == names[i]
                and keymap.ctrl == ctrl[i]
                and keymap.oskey == oskey[i]
            ):
                results[i] = keymap

    return results


def mount():
    wm = bpy.context.window_manager
    global default_keymaps
    default_keymaps = cast(List[bpy.types.KeyMapItem], [])
    # Disable delete keymaps
    for keymap_class, keymap_list in default_delete_keymaps.items():
        km_items = cast(Dict[str, bpy.types.KeyMap], wm.keyconfigs.default.keymaps)[
            keymap_class
        ].keymap_items
        km_items = cast(List[bpy.types.KeyMapItem], km_items)
        for keymap in km_items:
            if keymap.idname in keymap_list:
                keymap.active = False
                default_keymaps.append(keymap)

    # Active clipboard keymaps and disable default keymaps

    view_3d_km_items = cast(Dict[str, bpy.types.KeyMap], wm.keyconfigs.default.keymaps)[
        "3D View"
    ].keymap_items
    view_3d_km_items = cast(List[bpy.types.KeyMapItem], view_3d_km_items)

    for keymap in view_3d_km_items:
        if keymap.idname in default_clipboard_keymaps:
            keymap.active = False
            default_keymaps.append(keymap)

    new_keymaps_config = (
        [
            "lightdance.copy",
            "lightdance.copy",
            "lightdance.paste",
            "lightdance.paste",
        ],
        ["C", "C", "V", "V"],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
    )

    new_keymaps = check_keymaps_exist(
        view_3d_km_items,
        new_keymaps_config[0],
        new_keymaps_config[2],
        new_keymaps_config[3],
    )

    view_3d_km_items = cast(bpy.types.KeyMapItems, view_3d_km_items)
    for i in range(len(new_keymaps)):
        new_keymap = new_keymaps[i]

        if new_keymap is None:
            new_keymaps[i] = view_3d_km_items.new(
                new_keymaps_config[0][i],
                new_keymaps_config[1][i],
                ctrl=new_keymaps_config[2][i],
                oskey=new_keymaps_config[3][i],
                value="PRESS",
            )

        else:
            new_keymap.active = True

    global clipboard_keymaps

    clipboard_keymaps = cast(List[bpy.types.KeyMapItem], new_keymaps)


def unmount():
    for keymap in clipboard_keymaps:
        keymap.active = False
    for keymap in default_keymaps:
        keymap.active = True
