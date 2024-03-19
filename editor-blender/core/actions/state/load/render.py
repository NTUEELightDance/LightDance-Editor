import bpy


def setup_render():
    """
    clean render settings
    """
    bpy.context.scene.render.fps = 1000
    bpy.context.scene.render.fps_base = 1.0

    bpy.context.scene.render.use_simplify = True
    bpy.context.scene.render.simplify_subdivision = 0
    bpy.context.scene.render.simplify_volumes = 0
    bpy.context.scene.render.simplify_shadows = 0
    bpy.context.scene.render.simplify_child_particles_render = 0
    bpy.context.scene.eevee.gi_diffuse_bounces = 0
