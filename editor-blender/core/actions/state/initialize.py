import asyncio
from typing import Dict, List, Optional

import bpy

from ....api.auth_agent import auth_agent
from ....api.color_agent import color_agent
from ....api.control_agent import control_agent
from ....api.dancer_agent import dancer_agent
from ....api.led_agent import led_agent
from ....api.model_agent import model_agent
from ....client import client

# from ....client.cache import FieldPolicy, InMemoryCache, TypePolicy
from ....client.subscription import subscribe
from ....core.actions.state.app_state import (
    set_logged_in,
    set_ready,
    set_requesting,
    set_running,
)
from ....core.actions.state.color_map import set_color_map
from ....core.actions.state.control_map import set_control_map

# from ....core.actions.state.color_map import set_color_map
# from ....core.actions.state.control_map import set_control_map
from ....core.actions.state.current_pos import update_current_pos_by_index
from ....core.actions.state.current_status import (
    calculate_current_status_index,
    update_current_status_by_index,
)
from ....core.actions.state.editor import setup_control_editor
from ....core.actions.state.led_map import set_led_map

# from ....core.actions.state.pos_map import set_pos_map
from ....core.asyncio import AsyncTask
from ....core.states import state

# from ....core.utils.convert import (
#     color_map_query_to_state,
#     control_map_query_to_state,
#     pos_map_query_to_state,
# )
from ....core.utils.get_data import get_control, get_pos
from ....core.utils.ui import redraw_area

# from ....graphqls.queries import (
#     QueryColorMapPayload,
#     QueryControlMapPayload,
#     QueryPosMapPayload,
# )
from ....handlers import mount, unmount
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
    Selected,
    SelectedItem,
)
from ...states import state
from ...utils.operator import execute_operator
from ..state.load import load_data

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

    # Open clients with token
    token: str = get_storage("token")
    username: str = get_storage("username")
    state.token = token
    state.username = username

    await client.open_http()
    await client.open_file()

    # Check token
    set_requesting(True)
    token_valid = await auth_agent.check_token()
    set_requesting(False)

    set_running(True)

    if token_valid:
        set_logged_in(True)
        await init_blender()

    # Start background operators
    execute_operator("lightdance.animation_status_listener")
    execute_operator("lightdance.notification")

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


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

    # Setup control editor UI
    setup_control_editor()


def close_blender():
    set_running(False)
    set_logged_in(False)
    set_ready(False)

    if state.subscription_task is not None:
        state.subscription_task.cancel()
        state.subscription_task = None

    if state.init_editor_task is not None:
        state.init_editor_task.cancel()
        state.init_editor_task = None

    unmount()

    close_client_tasks = [
        client.close_http(),
        client.close_file(),
        client.close_graphql(),
    ]
    asyncio.get_event_loop().run_until_complete(asyncio.gather(*close_client_tasks))

    print("Blender closed")


async def init_editor():
    empty_task = asyncio.create_task(asyncio.sleep(0))

    batches_functions = [
        # [load_data, init_color_map],
        [init_models, init_dancers],
        [init_color_map, init_led_map],
        [init_current_pos, init_current_status],
        [load_data],
        # [init_current_status, init_current_pos, init_current_led_status, sync_led_effect_record],
        # [sync_current_led_status],
    ]
    batches_completes = [[False] * len(batch) for batch in batches_functions]

    while True:
        try:
            for batch in range(len(batches_functions)):
                batch_functions = batches_functions[batch]
                batch_completes = batches_completes[batch]
                batch_tasks: List[asyncio.Task[Optional[BaseException]]] = [
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
                        print(f"Batch {batch} failed: {result}")
                    else:
                        batch_completes[index] = True

                if not batch_done:
                    raise Exception(f"Batch {batch} failed")

            break
        except Exception as e:
            print(e)

        await asyncio.sleep(1)

    print("Editor initialized")

    set_ready(True)

    # Mount handlers
    mount()

    # Initialize current index
    bpy.context.scene.frame_current = 0
    state.current_control_index = calculate_current_status_index()
    update_current_status_by_index()

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


async def init_models():
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
        dancers: Dict[DancerName, int] = dict(
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

    print("Models initialized")


async def init_dancers():
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
        parts: Dict[PartName, int] = dict(
            [(part.name, part_index) for part_index, part in enumerate(dancer.parts)]
        )
        dancer_part_index_map[dancer.name] = DancerPartIndexMapItem(
            index=index, parts=parts
        )

    # selected: Selected = dict(
    #     [
    #         (dancer_name, SelectedItem(selected=False, parts=[]))
    #         for dancer_name in dancer_names
    #     ]
    # )

    state.dancers = dancers
    state.dancer_names = dancer_names
    state.part_type_map = part_type_map
    state.led_part_length_map = led_part_length_map

    state.dancers_array = dancers_array
    state.dancer_part_index_map = dancer_part_index_map

    # state.selected = selected

    print("Dancers initialized")


async def init_color_map():
    color_map = await color_agent.get_color_map()

    if color_map is None:
        raise Exception("Failed to initialize color map")

    set_color_map(color_map)
    print("Color map initialized")


async def init_led_map():
    led_map = await led_agent.get_led_map()
    if led_map is None:
        raise Exception("Failed to initialize LED map")

    set_led_map(led_map)

    print("LED map initialized")


async def init_control_map():
    control_map = await control_agent.get_control_map()
    if control_map is None:
        raise Exception("Control map not found")

    set_control_map(control_map)

    print("Control map initialized")


async def init_current_status():
    control_map, control_record = await get_control()

    if control_map is None or control_record is None:
        raise Exception("Failed to initialize control map")

    state.control_map = control_map
    state.control_record = control_record
    state.current_control_index = 0
    update_current_status_by_index()
    # TODO: Push status stack

    print("Current status initialized")


async def init_current_pos():
    pos_map, pos_record = await get_pos()
    if pos_map is None or pos_record is None:
        raise Exception("Failed to initialize pos map")

    state.pos_map = pos_map
    state.pos_record = pos_record
    state.current_pos_index = 0
    update_current_pos_by_index()

    # TODO: Push pos stack

    print("Current pos initialized")
