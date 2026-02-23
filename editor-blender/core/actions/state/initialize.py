import asyncio
import traceback

import bpy

from ....api.auth_agent import auth_agent
from ....api.color_agent import color_agent
from ....api.dancer_agent import dancer_agent
from ....api.led_agent import led_agent
from ....api.model_agent import model_agent
from ....client import client
from ....client.subscription import subscribe
from ....core.actions.state.app_state import (
    send_request,
    set_logged_in,
    set_ready,
    set_running,
    set_sync,
)
from ....core.actions.state.color_map import set_color_map
from ....core.actions.state.current_pos import update_current_pos_by_index
from ....core.actions.state.current_status import (
    calculate_current_status_index,
    update_current_status_by_index,
)
from ....core.actions.state.editor import setup_control_editor
from ....core.actions.state.led_map import set_led_map
from ....core.actions.state.partial_load import (
    init_dancer_selection_from_state,
    init_loaded_frame_range,
    move_current_frame_to_min_loaded_frame,
)
from ....core.asyncio import AsyncTask
from ....core.log import logger
from ....core.states import state
from ....core.utils.get_data import get_control, get_pos
from ....core.utils.ui import redraw_area
from ....handlers import mount_handlers, unmount_handlers
from ....properties.types import Preferences
from ....storage import get_storage
from ...models import (
    DancerName,
    DancerPartIndexMap,
    DancerPartIndexMapItem,
    Dancers,
    LEDPartLengthMap,
    ModelDancerIndexMap,
    ModelDancerIndexMapItem,
    Models,
    PartName,
    PartType,
    PartTypeMap,
)
from ...utils.convert import frame_to_time
from ...utils.operator import execute_operator
from ..state.load import init_assets, load_data
from .dopesheet import clear_pinned_timeline

# from ....core.actions.state.load.objects import check_local_object_list
# async def __merge_pos_map(
#     existing: Optional[QueryPosMapPayload], incoming: QueryPosMapPayload
# ) -> QueryPosMapPayload:
#     posMap = pos_map_query_to_state(incoming)
#     await set_pos_map(posMap)
#     return incoming
#
#
# async def __merge_control_map(
#     existing: Optional[QueryControlMapPayload], incoming: QueryControlMapPayload
# ) -> QueryControlMapPayload:
#     controlMap = control_map_query_to_state(incoming)
#     await set_control_map(controlMap)
#     return incoming
#
#
# async def __merge_color_map(
#     existing: Optional[QueryColorMapPayload], incoming: QueryColorMapPayload
# ) -> QueryColorMapPayload:
#     colorMap = color_map_query_to_state(incoming)
#     await set_color_map(colorMap)
#     return incoming


def read_preferences():
    preferences: Preferences = get_storage("preferences")
    state.preferences.auto_sync = preferences.auto_sync
    state.preferences.follow_frame = preferences.follow_frame
    state.preferences.show_waveform = preferences.show_waveform
    state.preferences.show_beat = preferences.show_beat
    state.preferences.show_nametag = preferences.show_nametag

    # Trigger property setter
    preferences.auto_sync = state.preferences.auto_sync
    preferences.follow_frame = state.preferences.follow_frame
    preferences.show_waveform = state.preferences.show_waveform
    preferences.show_beat = state.preferences.show_beat
    preferences.show_nametag = state.preferences.show_nametag


async def init():
    # Setup cache policies
    # client.configure_cache(
    #     InMemoryCache(
    #         policies={
    #             "PosMap": TypePolicy(
    #                 fields={
    #                     "frameIds": FieldPolicy(merge=__merge_pos_map),
    #                 }
    #             ),
    #             "ControlMap": TypePolicy(
    #                 fields={
    #                     "frameIds": FieldPolicy(merge=__merge_control_map),
    #                 }
    #             ),
    #             "colorMap": TypePolicy(
    #                 fields={
    #                     "colorMap": FieldPolicy(merge=__merge_color_map),
    #                 }
    #             ),
    #         }
    #     )
    # )

    read_preferences()

    # Open clients with token
    token: str = get_storage("token")
    username: str = get_storage("username")
    state.token = token
    state.username = username

    await client.open_http()
    await client.open_file()

    # Check token
    with send_request():
        token_valid = await auth_agent.check_token()

    set_running(True)

    # Auto login
    if token_valid:
        set_logged_in(True)
        await init_blender()

    # Start background operators
    execute_operator("lightdance.animation_status_listener")
    execute_operator("lightdance.notification")
    execute_operator("lightdance.ping")

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


async def reload():
    set_ready(False)

    unmount_handlers()
    logger.info("Handlers unmounted")

    await init_blender()


async def init_blender():
    await client.restart_http()
    await client.restart_graphql()

    if state.subscription_task is not None:
        state.subscription_task.cancel()
    state.subscription_task = AsyncTask(subscribe).exec()

    # Initialize editor
    if state.init_editor_task is not None:
        state.init_editor_task.cancel()
    state.init_editor_task = AsyncTask(init_editor).exec()


def close_blender():
    set_running(False)
    set_sync(False)
    set_logged_in(False)
    set_ready(False)

    if state.subscription_task is not None:
        state.subscription_task.cancel()
        state.subscription_task = None

    if state.init_editor_task is not None:
        state.init_editor_task.cancel()
        state.init_editor_task = None

    unmount_handlers()

    close_client_tasks = [
        client.close_http(),
        client.close_file(),
        client.close_graphql(),
    ]
    asyncio.get_event_loop().run_until_complete(asyncio.gather(*close_client_tasks))

    logger.info("Blender closed")


async def init_editor():
    empty_task = asyncio.create_task(asyncio.sleep(0))

    batches_functions = [
        [init_models, init_dancers],
        [init_color_map, init_led_map],
        [init_pos_map, init_control_map],
        [init_assets],
    ]
    ...
    batches_completes = [[False] * len(batch) for batch in batches_functions]

    while True:
        try:
            for batch in range(len(batches_functions)):
                batch_functions = batches_functions[batch]
                batch_completes = batches_completes[batch]
                batch_tasks: list[asyncio.Task[BaseException | None]] = [
                    empty_task
                ] * len(batch_functions)

                for index, function in enumerate(batch_functions):
                    if not batch_completes[index]:
                        batch_tasks[index] = asyncio.create_task(function())

                batch_results = await asyncio.gather(
                    *batch_tasks, return_exceptions=True
                )

                batch_done = True
                for index, result in enumerate(batch_results):
                    if isinstance(result, BaseException):
                        batch_done = False
                        # FIXME: This function may lose stack trace of result
                        logger.error(
                            f"Batch {batch} failed: {result}\n{''.join(traceback.format_tb(result.__traceback__))}"
                        )
                    else:
                        batch_completes[index] = True

                if not batch_done:
                    logger.exception(f"Batch {batch} failed")
                    raise

            break
        except Exception as e:
            logger.exception(e)

        await asyncio.sleep(2)
    state.user_log = ""
    state.loading = True

    # Must place here, or else init_ctrl_map may access obj of previously unselected dancers after reloading files that are partialy loaded.

    state.show_dancers = [True] * len(state.dancers)
    init_dancer_selection_from_state()
    init_loaded_frame_range()


async def init_load():
    if not bpy.context:
        return
    state.loading = False
    redraw_area({"VIEW_3D"})
    await load_data()
    logger.info("Editor initialized")
    # In case the connection is lost during long initialization
    await client.restart_http()
    await client.restart_graphql()

    set_ready(True)
    set_sync(True)

    # Mount handlers
    mount_handlers()
    logger.info("Handlers mounted")

    # Initialize current index and time
    move_current_frame_to_min_loaded_frame()
    state.current_control_index = calculate_current_status_index()
    update_current_status_by_index()

    bpy.context.window_manager["ld_time"] = frame_to_time(0)

    # Setup control editor UI
    clear_pinned_timeline()
    setup_control_editor()

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    area_ui_type = "TIMELINE"
    areas = [
        area for area in bpy.context.window.screen.areas if area.ui_type == area_ui_type
    ]

    with bpy.context.temp_override(
        window=bpy.context.window,
        area=areas[0],
        region=[region for region in areas[0].regions if region.type == "WINDOW"][0],
        screen=bpy.context.window.screen,
    ):
        if bpy.ops.action.view_frame.poll():  # type:ignore
            bpy.ops.action.view_frame()


async def init_models():
    state.user_log = "Initializing models..."

    models_array = await model_agent.get_models()

    if models_array is None:
        raise Exception("Failed to initialize models")

    model_names = [model.name for model in models_array]
    models: Models = dict(
        [
            (model.name, [dancer_name for dancer_name in model.dancers])
            for model in models_array
        ]
    )

    model_dancer_index_map: ModelDancerIndexMap = {}

    for index, model in enumerate(models_array):
        dancers: dict[DancerName, int] = dict(
            [
                (dancer_name, dancer_index)
                for dancer_index, dancer_name in enumerate(model.dancers)
            ]
        )
        model_dancer_index_map[model.name] = ModelDancerIndexMapItem(
            index=index, dancers=dancers
        )

    state.models = models
    state.model_names = model_names
    state.models_array = models_array
    state.model_dancer_index_map = model_dancer_index_map

    logger.info("Models initialized")


async def init_dancers():
    state.user_log = "Initializing dancers..."

    dancers_array = await dancer_agent.get_dancers()

    if dancers_array is None:
        raise Exception("Failed to initialize dancers")

    dancer_names = [dancer.name for dancer in dancers_array]
    dancers: Dancers = dict(
        [
            (dancer.name, [part.name for part in dancer.parts])
            for dancer in dancers_array
        ]
    )

    part_type_map: PartTypeMap = {}
    led_part_length_map: LEDPartLengthMap = {}

    for dancer in dancers_array:
        for part in dancer.parts:
            part_type_map[part.name] = part.type
            if part.type == PartType.LED and part.length is not None:
                led_part_length_map[part.name] = part.length

    dancer_part_index_map: DancerPartIndexMap = {}

    for index, dancer in enumerate(dancers_array):
        parts: dict[PartName, int] = dict(
            [(part.name, part_index) for part_index, part in enumerate(dancer.parts)]
        )
        dancer_part_index_map[dancer.name] = DancerPartIndexMapItem(
            index=index, parts=parts
        )

    state.dancers = dancers
    state.dancer_names = dancer_names
    state.part_type_map = part_type_map
    state.led_part_length_map = led_part_length_map

    state.dancers_array = dancers_array
    state.dancer_part_index_map = dancer_part_index_map

    if len(state.show_dancers) == 0:
        state.show_dancers = [True] * len(state.dancer_names)

    logger.info("Dancers initialized")


async def init_color_map():
    state.user_log = "Initializing color map..."

    color_map = await color_agent.get_color_map()

    if color_map is None:
        raise Exception("Failed to initialize color map")

    set_color_map(color_map)
    logger.info("Color map initialized")


async def init_led_map():
    state.user_log = "Initializing LED map..."

    led_map = await led_agent.get_led_map()
    if led_map is None:
        raise Exception("Failed to initialize LED map")

    set_led_map(led_map)

    logger.info("LED map initialized")


async def init_control_map():
    state.user_log = "Initializing control map..."

    control_map, control_record = await get_control()

    if control_map is None or control_record is None:
        raise Exception("Failed to initialize control map")

    state.control_map_MODIFIED = control_map
    state.control_record = control_record
    state.control_start_record = [control_map[id].start for id in control_record]

    state.current_control_index = 0
    update_current_status_by_index()

    logger.info("Control map initialized")


async def init_pos_map():
    state.user_log = "Initializing pos map..."

    pos_map, pos_record = await get_pos()
    if pos_map is None or pos_record is None:
        raise Exception("Failed to initialize pos map")

    state.pos_map_MODIFIED = pos_map
    state.pos_record = pos_record
    state.pos_start_record = [pos_map[id].start for id in pos_record]

    state.current_pos_index = 0
    update_current_pos_by_index()

    logger.info("Pos map initialized")
