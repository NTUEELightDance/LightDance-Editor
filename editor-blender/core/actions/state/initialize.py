from typing import Dict

from ....api.color_agent import color_agent
from ....api.dancer_agent import dancer_agent
from ....client import client
from ....handlers import mount
from ....preferences import get_preference
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


async def init_blender():
    # Open clients with token
    token: str = get_preference("token")
    state.token = token

    await client.open_http()
    # await client.open_graphql()

    # Mount handlers
    mount()


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


async def init_color_map():
    color_map = await color_agent.get_color_map()

    state.color_map = color_map
