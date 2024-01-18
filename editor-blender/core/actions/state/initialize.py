import asyncio
from typing import Dict, List, Optional

from ....api.auth_agent import auth_agent
from ....api.color_agent import color_agent
from ....api.dancer_agent import dancer_agent
from ....client import client
from ....client.cache import FieldPolicy, InMemoryCache, TypePolicy
from ....client.subscription import subscribe
from ....core.actions.state.color_map import set_color_map
from ....core.actions.state.control_map import set_control_map
from ....core.actions.state.current_pos import update_current_pos_by_index
from ....core.actions.state.current_status import update_current_status_by_index
from ....core.actions.state.pos_map import set_pos_map
from ....core.asyncio import AsyncTask
from ....core.states import state
from ....core.utils.convert import (
    color_map_query_to_state,
    control_map_query_to_state,
    pos_map_query_to_state,
)
from ....core.utils.get_data import get_control, get_pos
from ....core.utils.ui import redraw_area
from ....graphqls.queries import (
    QueryColorMapPayload,
    QueryControlMapPayload,
    QueryPosMapPayload,
)
from ....handlers import mount
from ....storage import get_storage
from ...models import (
    DancerPartIndexMap,
    DancerPartIndexMapItem,
    Dancers,
    LEDPartLengthMap,
    PartName,
    PartType,
    PartTypeMap,
    Selected,
    SelectedItem,
)
from ...states import state
from ..state.load import load_data


async def __merge_pos_map(
    existing: Optional[QueryPosMapPayload], incoming: QueryPosMapPayload
) -> QueryPosMapPayload:
    posMap = pos_map_query_to_state(incoming)
    await set_pos_map(posMap)
    return incoming


async def __merge_control_map(
    existing: Optional[QueryControlMapPayload], incoming: QueryControlMapPayload
) -> QueryControlMapPayload:
    controlMap = control_map_query_to_state(incoming)
    await set_control_map(controlMap)
    return incoming


async def __merge_color_map(
    existing: Optional[QueryColorMapPayload], incoming: QueryColorMapPayload
) -> QueryColorMapPayload:
    colorMap = color_map_query_to_state(incoming)
    await set_color_map(colorMap)
    return incoming


async def init_blender():
    # Setup cache policies
    client.configure_cache(
        InMemoryCache(
            policies={
                "PosMap": TypePolicy(
                    fields={
                        "frameIds": FieldPolicy(merge=__merge_pos_map),
                    }
                ),
                "ControlMap": TypePolicy(
                    fields={
                        "frameIds": FieldPolicy(merge=__merge_control_map),
                    }
                ),
                "colorMap": TypePolicy(
                    fields={
                        "colorMap": FieldPolicy(merge=__merge_color_map),
                    }
                ),
            }
        )
    )

    # Open clients with token
    token: str = get_storage("token")
    state.token = token

    await client.open_http()

    # Check token
    token_valid = await auth_agent.check_token()
    if token_valid:
        state.is_logged_in = True
        state.is_running = True
        redraw_area("VIEW_3D")

        await client.open_graphql()

        if state.subscription_task is not None:
            state.subscription_task.cancel()
        state.subscription_task = AsyncTask(subscribe).exec()

        # Initialize editor
        if state.init_editor_task is not None:
            state.init_editor_task.cancel()
        state.init_editor_task = AsyncTask(init_editor).exec()

        mount()

    else:
        state.is_running = True
        redraw_area("VIEW_3D")


def close_blender():
    state.is_running = False
    state.is_logged_in = False
    state.ready = False

    if state.subscription_task is not None:
        state.subscription_task.cancel()
        state.subscription_task = None

    if state.init_editor_task is not None:
        state.init_editor_task.cancel()
        state.init_editor_task = None


async def init_editor():
    empty_task = asyncio.create_task(asyncio.sleep(0))

    batches_functions = [
        [load_data, init_dancers, init_color_map],
        [init_current_status, init_current_pos],
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

    state.ready = True
    # NOTE: Testing
    # state.edit_state = EditMode.EDITING

    redraw_area("VIEW_3D")


async def init_dancers():
    dancers_array = await dancer_agent.get_dancers()

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

    selected: Selected = dict(
        [
            (dancer_name, SelectedItem(selected=False, parts=[]))
            for dancer_name in dancer_names
        ]
    )

    state.dancers = dancers
    state.dancer_names = dancer_names
    state.part_type_map = part_type_map
    state.led_part_length_map = led_part_length_map

    state.dancers_array = dancers_array
    state.dancer_part_index_map = dancer_part_index_map

    state.selected = selected

    print("Dancers initialized")


async def init_color_map():
    color_map = await color_agent.get_color_map()

    state.color_map = color_map

    print("Color map initialized")


async def init_current_status():
    _, control_record = await get_control()

    state.control_record = control_record
    update_current_status_by_index(0)
    # TODO: Push status stack

    print("Current status initialized")


async def init_current_pos():
    _, pos_record = await get_pos()

    state.pos_record = pos_record
    update_current_pos_by_index(0)
    # TODO: Push pos stack

    print("Current pos initialized")
