import bpy, os, sys, shutil, requests

import gpu
from gpu_extras.batch import batch_for_shader
from bpy.types import Operator

from bpy.app.handlers import persistent
import requests
import bpy.path
from .. import utils

# waveform settings
sw_coordlist = []
handle_dope = None
handle_graph = None
image = None
height_mode = 'RELATIVE'
file_name = 'waveform.png'
waveform_path = '//' + file_name

# for fetching image from file-server
base_url = "http://localhost:8081"
waveform_url = f"{base_url}/music/waveform.png"


class SWD_OT_fetch_waveform(Operator):
    bl_idname = "fn.fetch_waveform"
    bl_label = "Fetch Waveform"
    bl_description = "Fetch waveform"
    bl_options = {"REGISTER"}

    def execute(self, context):
        # global file_path
        blender_path = bpy.data.filepath
        directory = os.path.dirname(blender_path)
        global file_name
        file_path = os.path.join(directory, file_name)
        global waveform_url

        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"File '{file_path}' deleted successfully.")
        print(f"Downloadign file '{file_path}'")
        # Make a GET request
        response = requests.get(waveform_url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Access the content of the response
            data = response.content
            # Do something with the data, e.g., save it to a file
            with open(file_path, "wb") as file:
                file.write(data)
            print("File downloaded successfully.")
        else:
            print(f"Error: {response.status_code} - {response.text}")
        
        return {'FINISHED'}


def refresh():
    for window in bpy.context.window_manager.windows:
        screen = window.screen
        for area in screen.areas:
            if area.type in ('GRAPH_EDITOR',  'DOPESHEET_EDITOR'):
                area.tag_redraw()

def draw_callback_px(self, context):
    '''Draw callback use by modal to draw in viewport'''
    if context.area.type not in ('DOPESHEET_EDITOR', 'GRAPH_EDITOR'):
        return
    if context.area.type == 'DOPESHEET_EDITOR':
        # available modes : 'TIMELINE', 'DOPESHEET', 'FCURVES','ACTION','GPENCIL','MASK','CACHEFILE'
        if context.space_data.mode == 'TIMELINE':
            if not context.scene.swd_settings.use_time:
                return
        else:
            if not context.scene.swd_settings.use_dope:
                return
        # if context.space_data.mode not in ('DOPESHEET', 'FCURVES','ACTION','GPENCIL','MASK','CACHEFILE'):
        #     return
    if context.area.type == 'GRAPH_EDITOR' and not context.scene.swd_settings.use_graph:
        return

    margin = 12 * context.preferences.view.ui_scale

    if not context.region:
        return
    coords = [\
        [context.region.view2d.view_to_region(co[0], 0, clip=False)[0], (co[1])+margin]\
        for co in sw_coordlist]

    print("coords = ", coords)
    ## Absolute offset
    if height_mode == 'RELATIVE':
        ## relative height offset
        height = sw_coordlist[3][1]
        # ratio = (context.region.height * height) / 1000
        ratio = (context.region.height/height) / 1000
        # final_height = (coords[2][1] + context.scene.swd_settings.height_offset) * ratio
        final_height = (coords[2][1] * context.scene.swd_settings.height_offset) * ratio
        coords[3][1] = coords[2][1] = final_height
        # height = sw_coordlist[3][1]
        # ratio = (context.region.height * height) / 1000
        # final_height = (coords[2][1] + context.scene.swd_settings.height_offset) * ratio
        # coords[3][1] = coords[2][1] = final_height
    else:
        coords[2][1] += context.scene.swd_settings.height_offset * 10
        coords[3][1] += context.scene.swd_settings.height_offset * 10


    shader = gpu.shader.from_builtin('IMAGE')
    batch = batch_for_shader(
        shader, 'TRI_FAN',
        {
            "pos": coords,
            "texCoord": ((0, 0), (1, 0), (1, 1), (0, 1)),
        },
    )

    use_bgl = bpy.app.version < (4,0,0)
    if use_bgl:
        import bgl
        if image.gl_load():
            raise Exception()
        
        bgl.glEnable(bgl.GL_BLEND) # bgl.GL_SRGB8_ALPHA8
        bgl.glActiveTexture(bgl.GL_TEXTURE0)
        bgl.glBindTexture(bgl.GL_TEXTURE_2D, image.bindcode)

        bgl.glBlendFunc(bgl.GL_ONE, bgl.GL_ONE) # overlay with a kind of additive filter

        shader.bind()

        bgl.glTexParameterf(bgl.GL_TEXTURE_2D, bgl.GL_TEXTURE_MIN_FILTER, bgl.GL_NEAREST)
        bgl.glTexParameterf(bgl.GL_TEXTURE_2D, bgl.GL_TEXTURE_MAG_FILTER, bgl.GL_NEAREST)

        shader.uniform_int("image", 0)
        batch.draw(shader)

        bgl.glDisable(bgl.GL_BLEND)
    
    else:
        texture = gpu.texture.from_image(image)
        ## gpu.state.depth_mask_set(True)
        ## gpu.state.depth_test_set('LESS_EQUAL')
        ## gpu.state.blend_set('ALPHA')
        gpu.state.blend_set('ADDITIVE') # _PREMULT
        shader.uniform_sampler("image", texture)
        shader.bind()
        batch.draw(shader)
        gpu.state.blend_set('NONE')


# called when click "ON"
# process the music file and form waveform
class SWD_OT_enable_draw(Operator):
    bl_idname = "anim.enable_draw"
    bl_label = "Wave display On"
    bl_description = "Active the display"
    bl_options = {"REGISTER"}

    def execute(self, context):
        global sw_coordlist
        global handle_dope
        global handle_graph
        global height_mode
        global image
        global waveform_path
        global file_name
        global waveform_url
        
        blender_path = bpy.data.filepath
        directory = os.path.dirname(blender_path)
        
        file_path = os.path.join(directory, file_name)
        

        utils.execute_operator('anim.disable_draw')
        if not os.path.exists(file_path):
            print("Waveform doesn't exist!")
            utils.execute_operator('fn.fetch_waveform')
        image = bpy.data.images.get(waveform_path)
        if image:
            bpy.data.images.remove(image)
        image = bpy.data.images.load(waveform_path, check_existing=False)
        # print("newe addon")
        sw_start = 0
        if not bpy.context.scene.frame_end:
            sw_end = 420000
        else:
            sw_end = bpy.context.scene.frame_end

        sw_frames = sw_end - sw_start
        height = ((sw_frames * image.size[1]) // image.size[0])

        ## show full image
        sw_coordlist = ((sw_start, 0),
                        (sw_end, 0),
                        (sw_end, height),
                        (sw_start, height))

        ## enable handler
        view_type = bpy.types.SpaceDopeSheetEditor
        spacetype = 'WINDOW' # 'PREVIEW'
        args = (self, context)
        handle_dope = view_type.draw_handler_add(
                draw_callback_px, args, spacetype, 'POST_PIXEL')

        handle_graph = bpy.types.SpaceGraphEditor.draw_handler_add(
                draw_callback_px, args, spacetype, 'POST_PIXEL')

        refresh()
        return {'FINISHED'}

    
            

def disable_waveform_draw_handler():
    global handle_dope
    global handle_graph
    stopped = []
    if handle_dope:
        bpy.types.SpaceDopeSheetEditor.draw_handler_remove(handle_dope, 'WINDOW')
        handle_dope = None
        stopped.append('Dopesheet display')
    if handle_graph:
        bpy.types.SpaceGraphEditor.draw_handler_remove(handle_graph, 'WINDOW')
        handle_graph = None
        stopped.append('Graph display')
    refresh()
    return stopped

# when "OFF" is clickeds
class SWD_OT_disable_draw(Operator):
    bl_idname = "anim.disable_draw"
    bl_label = "Wave display off"
    bl_description = "Active the display"
    bl_options = {"REGISTER"}

    def execute(self, context):
        global sw_coordlist

        stopped = disable_waveform_draw_handler()
        if not stopped:
            self.report({'WARNING'}, 'Already disabled')

        return {'FINISHED'}

classes=(
SWD_OT_fetch_waveform,
SWD_OT_enable_draw,
SWD_OT_disable_draw,
)

@persistent
def disable_wave_on_load(dummy):
    disable_waveform_draw_handler()

def register(): 
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.app.handlers.load_pre.append(disable_wave_on_load)

def unregister():
    disable_waveform_draw_handler()
    if 'disable_wave_on_load' in [hand.__name__ for hand in bpy.app.handlers.load_pre]:
        bpy.app.handlers.load_pre.remove(disable_wave_on_load)
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)