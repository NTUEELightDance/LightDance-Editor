import bpy


def update_current_index(scene: bpy.types.Scene):
    frame = scene.frame_current
    # TODO: Update current control_index, pos_index or effect_index of states


def register():
    bpy.app.handlers.frame_change_post.append(update_current_index)


def unregister():
    bpy.app.handlers.frame_change_post.remove(update_current_index)
