import bpy

from ...core.models import EditMode, Editor, SelectMode
from ...core.states import state
from ...core.utils.notification import notify

clipboard = {}
# save parts' names for check
part_name = []
# fix name bug like human -> ""
name_bug = [""]

# attributes for copy & paste
fiber_attrs = ["ld_alpha", "ld_color"]
LED_attrs = ["ld_alpha", "ld_effect"]


class CopyOperator(bpy.types.Operator):
    bl_idname = "lightdance.copy"
    bl_label = "Copy"

    def execute(self, context: bpy.types.Context):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", "Not Control Editor")
            return {"FINISHED"}

        if state.edit_state == EditMode.IDLE:
            notify("INFO", "Not Edit Mode")
            return {"FINISHED"}

        if state.selection_mode == SelectMode.DANCER_MODE:
            try:
                active_obj = bpy.context.view_layer.objects.active.children

                clipboard.clear()
                part_name.clear()

                for obj in active_obj:
                    # save data for every part
                    part_dict = {}

                    name = getattr(obj, "ld_part_name")

                    # fix no part name bug
                    if name in name_bug:
                        continue

                    match getattr(obj, "ld_light_type"):
                        case "fiber":
                            # fiber -> alpha & color
                            for attr in fiber_attrs:
                                part_dict.update({attr: getattr(obj, attr)})

                        case "led":
                            # LED -> alpha & effect
                            for attr in LED_attrs:
                                part_dict.update({attr: getattr(obj, attr)})

                        case _:
                            pass

                    # add dict(ld_part_name:ld_alpha,ld_color,ld_effect)
                    part_name.append(name)
                    clipboard.update({name: part_dict})  # type: ignore

                # check selectMode & name
                clipboard.update({"selection_mode": SelectMode.DANCER_MODE})
                clipboard.update({"name": bpy.context.view_layer.objects.active.name})
                notify(
                    "INFO",
                    f"copied {bpy.context.view_layer.objects.active.name} into clipboard",
                )
            except:
                pass

        if state.selection_mode == SelectMode.PART_MODE:
            try:
                active_obj = bpy.context.view_layer.objects.active

                part_dict = {}

                name = getattr(active_obj, "ld_part_name")

                if name in name_bug:
                    return {"FINISHED"}

                clipboard.clear()
                part_name.clear()

                light_type = getattr(active_obj, "ld_light_type")

                match light_type:
                    case "fiber":
                        # fiber -> alpha & color
                        for attr in fiber_attrs:
                            part_dict.update({attr: getattr(active_obj, attr)})

                    case "led":
                        # LED -> alpha & effect
                        for attr in LED_attrs:
                            part_dict.update({attr: getattr(active_obj, attr)})

                # add dict(ld_part_name:ld_alpha,ld_color,ld_effect)
                part_name.append(light_type)
                clipboard.update({light_type: part_dict})  # type: ignore

                # check selectMode & name
                clipboard.update({"selection_mode": SelectMode.PART_MODE})
                clipboard.update({"name": bpy.context.view_layer.objects.active.name})
                notify(
                    "INFO",
                    f"copied {bpy.context.view_layer.objects.active.name} into clipboard",
                )
            except:
                pass

        return {"FINISHED"}


class PasteOperator(bpy.types.Operator):
    bl_idname = "lightdance.paste"
    bl_label = "Paste"

    def execute(self, context: bpy.types.Context):
        if state.editor != Editor.CONTROL_EDITOR:
            notify("INFO", f"Not Control Editor")
            return {"FINISHED"}

        if state.edit_state == EditMode.IDLE:
            notify("INFO", f"Not Edit Mode")
            return {"FINISHED"}

        if clipboard == {}:
            notify("INFO", f"Not copied yet")
            return {"FINISHED"}

        if (
            clipboard["selection_mode"] == SelectMode.DANCER_MODE
            and state.selection_mode == SelectMode.DANCER_MODE
        ):
            part = ""
            try:
                if clipboard["name"] == bpy.context.view_layer.objects.active.name:
                    return {"FINISHED"}

                active_obj = bpy.context.view_layer.objects.active.children

                # check is same type by compare all part name
                check_part_name = []
                for obj in active_obj:
                    check_part_name.append(getattr(obj, "ld_part_name"))

                # fix no part name bug
                for name in name_bug:
                    try:
                        check_part_name.remove("")
                    except:
                        pass

                # check is same type by compare all part name
                if len(part_name) != len(check_part_name):
                    notify("INFO", f"Wrong object type")
                    return {"FINISHED"}

                for name in check_part_name:
                    if name not in part_name:
                        notify("INFO", f"Wrong object type")
                        return {"FINISHED"}

                for copy, paste in zip(part_name, check_part_name):
                    if paste != copy:
                        notify("INFO", f"Wrong object type")
                        return {"FINISHED"}

                # paste
                for obj in active_obj:
                    part = getattr(obj, "ld_part_name")
                    # fix no part name bug
                    if part in name_bug:
                        continue

                    paste = clipboard[part]  # type: ignore

                    match getattr(obj, "ld_light_type"):
                        case "fiber":
                            # fiber -> alpha & color
                            for attr in fiber_attrs:
                                setattr(obj, attr, paste[attr])

                        case "led":
                            # LED -> alpha & effect
                            for attr in LED_attrs:
                                setattr(obj, attr, paste[attr])

                        case _:
                            pass
                notify(
                    "INFO",
                    f"copied {clipboard['name']} into {bpy.context.view_layer.objects.active.name}",
                )
            except:
                pass

        if (
            state.selection_mode == SelectMode.PART_MODE
            and clipboard["selection_mode"] == SelectMode.PART_MODE
        ):
            try:
                if clipboard["name"] == bpy.context.view_layer.objects.active.name:
                    return {"FINISHED"}

                active_obj = bpy.context.view_layer.objects.active
                check_part_name = []

                part = getattr(active_obj, "ld_part_name")

                if part in name_bug:
                    return {"FINISHED"}

                light_type = getattr(active_obj, "ld_light_type")

                check_part_name.append(light_type)

                if check_part_name != part_name:
                    notify("INFO", f"Wrong object type")
                    return {"FINISHED"}

                paste = clipboard[light_type]  # type: ignore

                match light_type:
                    case "fiber":
                        # fiber -> alpha & color
                        for attr in fiber_attrs:
                            setattr(active_obj, attr, paste[attr])

                    case "led":
                        # LED -> alpha & effect
                        for attr in LED_attrs:
                            setattr(active_obj, attr, paste[attr])

                    case _:
                        pass

                notify(
                    "INFO",
                    f"copied {clipboard['name']} into {bpy.context.view_layer.objects.active.name}",
                )
            except:
                pass

        return {"FINISHED"}


def register():
    bpy.utils.register_class(CopyOperator)
    bpy.utils.register_class(PasteOperator)
    try:
        wm = bpy.context.window_manager
        kc_items = wm.keyconfigs.default.keymaps["3D View"].keymap_items
        copy_km = kc_items["view3d.copybuffer"]
        paste_km = kc_items["view3d.pastebuffer"]
        kc_items.remove(copy_km)
        kc_items.remove(paste_km)
        kc_items.new("lightdance.copy", "C", value="PRESS", ctrl=1)
        kc_items.new("lightdance.paste", "V", value="PRESS", ctrl=1)
    except:
        pass


def unregister():
    bpy.utils.unregister_class(CopyOperator)
    bpy.utils.unregister_class(PasteOperator)
    try:
        wm = bpy.context.window_manager
        kc_items = wm.keyconfigs.default.keymaps["3D View"].keymap_items
        kc_items.remove(kc_items.find_from_operator("lightdance.copy"))
        kc_items.remove(kc_items.find_from_operator("lightdance.paste"))
    except:
        pass
