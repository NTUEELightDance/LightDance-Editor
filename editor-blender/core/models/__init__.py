<<<<<<< HEAD
from asyncio import Task
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple, Union

ID = int

ColorName = str
LEDEffectName = str
ColorCode = str
RGB = Tuple[int, int, int]
RGBA = Tuple[int, int, int, int]
LEDEffectID = int
ColorID = int


@dataclass
class Color:
    id: int
    name: ColorName
    color_code: ColorCode
    rgb: RGB


ColorMap = Dict[ColorID, Color]


@dataclass
class LEDBuldData:
    color_id: ColorID
    alpha: int
    rgb: Optional[RGB] = None  # for calculating fade


@dataclass
class LEDEffect:
    id: LEDEffectID
    name: LEDEffectName
    effect: List[LEDBuldData]


LEDEffectIDTable = Dict[LEDEffectID, LEDEffect]

PartName = str
DancerName = str

LEDPartName = str

LEDMap = Dict[LEDPartName, Dict[LEDEffectName, LEDEffect]]

MapID = int
=======
from typing import (
    List,
    Dict,
    Optional
)
from enum import Enum
from dataclasses import dataclass


EffectID = int
ColorID = int

PartName = str
DancerName = str

MapID = str
>>>>>>> f9bf97e (add basic structure)


@dataclass
class LEDData:
<<<<<<< HEAD
    effect_id: LEDEffectID
=======
    effect_id: EffectID
>>>>>>> f9bf97e (add basic structure)
    alpha: int


@dataclass
class FiberData:
    color_id: ColorID
    alpha: int


<<<<<<< HEAD
PartData = Union[LEDData, FiberData]
DancerStatus = Dict[PartName, PartData]

=======
PartData = LEDData | FiberData
DancerStatus = Dict[PartName, PartData]
>>>>>>> f9bf97e (add basic structure)
ControlMapStatus = Dict[DancerName, DancerStatus]


@dataclass
class ControlMapElement:
    start: int
    fade: bool
    status: ControlMapStatus


ControlMap = Dict[MapID, ControlMapElement]

<<<<<<< HEAD
ControlRecord = List[MapID]

=======
>>>>>>> f9bf97e (add basic structure)

@dataclass
class Location:
    x: float
    y: float
    z: float


PosMapStatus = Dict[DancerName, Location]


@dataclass
class PosMapElement:
    start: int
    pos: PosMapStatus


PosMap = Dict[MapID, PosMapElement]

<<<<<<< HEAD
PosRecord = List[MapID]


class EditMode(Enum):
    IDLE = 0
    EDITING = 1
=======

class EditMode(Enum):
    IDLE = 0
    EDITING = 0
>>>>>>> f9bf97e (add basic structure)


class Editor(Enum):
    CONTROL_EDITOR = 0
    POS_EDITOR = 1
    LED_EDITOR = 2


@dataclass
class EditingData:
    start: int
    frame_id: int
    index: int


<<<<<<< HEAD
class PartType(Enum):
    LED = "LED"
    FIBER = "FIBER"


PartTypeMap = Dict[PartName, PartType]
LEDPartLengthMap = Dict[LEDPartName, int]


Dancers = Dict[DancerName, List[PartName]]


@dataclass
class DancersArrayPartsItem:
    name: PartName
    type: PartType
    length: Optional[int]


@dataclass
class DancersArrayItem:
    name: DancerName
    parts: List[DancersArrayPartsItem]


DancersArray = List[DancersArrayItem]


@dataclass
class DancerPartIndexMapItem:
    index: int
    parts: Dict[PartName, int]


DancerPartIndexMap = Dict[DancerName, DancerPartIndexMapItem]


@dataclass
class SelectedItem:
    selected: bool
    parts: List[Tuple[PartName, PartType]]


Selected = Dict[DancerName, SelectedItem]


class SelectedPartType(Enum):
    DANCER = 0
    FIBER = 1
    LED = 2
    MIXED_LIGHT = 3


@dataclass
class ColorMapUpdates:
    added: List[Color]
    updated: List[Color]
    deleted: List[ColorID]


@dataclass
class ControlMapUpdates:
    added: List[Tuple[MapID, ControlMapElement]]
    updated: List[Tuple[MapID, ControlMapElement]]
    deleted: List[MapID]


@dataclass
class PosMapUpdates:
    added: List[Tuple[MapID, PosMapElement]]
    updated: List[Tuple[MapID, PosMapElement]]
    deleted: List[MapID]


@dataclass
class State:
    is_running: bool
    is_logged_in: bool
    is_playing: bool

    subscription_task: Optional[Task[None]]
    init_editor_task: Optional[Task[None]]

    token: str
    ready: bool
=======
@dataclass
class State:
    is_running: bool
    token: str
>>>>>>> f9bf97e (add basic structure)

    control_map: ControlMap
    pos_map: PosMap

<<<<<<< HEAD
    control_record: ControlRecord
    pos_record: PosRecord

    led_map: LEDMap
    led_effect_id_table: LEDEffectIDTable
=======
    # TODO: Add these
    # led_map: LEDMap
    # led_effect_id_table: LEDEffectIDtable
>>>>>>> f9bf97e (add basic structure)

    current_control_index: int
    current_pos_index: int
    current_led_index: int

    # NOTE: Maybe we don't need these
<<<<<<< HEAD
    current_fade: bool
    current_status: ControlMapStatus
    current_pos: PosMapStatus

    current_editing_frame: int
    current_editing_detached: bool
    current_editing_frame_synced: bool
=======
    # current_fade: bool
    # current_status: ControlMapStatus
    # current_pos: PosMapStatus
>>>>>>> f9bf97e (add basic structure)

    # NOTE: Guess we can't implement these
    # status_stack: List[ControlMapStatus]
    # status_stack_index: int
    # pos_stack: List[PosMapStatus]
    # pos_stack_index: int

    # TODO: Add these
    # led_effect_record: LEDEffectRecord
    # current_led_status: CurrentLEDStatus

    edit_state: EditMode
    editor: Editor
    editing_data: EditingData
    # NOTE: Guess we can't implement this
    # selection_mode: SelectMode

    # NOTE: Maybe we don't need these
    # selected: Selected
<<<<<<< HEAD
    selected_obj_names: List[str]
    selected_obj_type: Optional[SelectedPartType]
=======
>>>>>>> f9bf97e (add basic structure)
    # selected_leds: List[int]

    # TODO: Add these
    # current_led_effect_reference_dancer: Optional[DancerName]  # the dancer whose LED part is being edited
    # current_led_partName: Optional[LEDPartName]  # the LED part whose effect is being edited
    # current_led_effect_name: Optional[LEDEffectName]  # the LED effect name being edited
    # current_led_effect_start: int  # the start time on the timeline where currentLEDEffect is displayed during editing
    # current_led_effect: Optional[LEDEffect]  # the LED effect being edited

    # TODO: Add these
<<<<<<< HEAD
    dancers: Dancers
    dancer_names: List[DancerName]
    part_type_map: PartTypeMap
    led_part_length_map: LEDPartLengthMap
    color_map: ColorMap
    # effect_list: EffectListType

    # TODO: Add these
    dancers_array: DancersArray
    dancer_part_index_map: DancerPartIndexMap
=======
    # dancers: Dancers
    # dancer_names: List[DancerName]
    # part_type_map: PartTypeMap
    # led_part_length_map: LEDPartLengthMap
    # color_map: ColorMap
    # effect_list: EffectListType

    # TODO: Add these
    # dancers_array: DancersArray
    # dancer_part_index_map: DancerPartIndexMap
>>>>>>> f9bf97e (add basic structure)

    # TODO: Add these
    # rpi_status: RPiStatus
    # shell_history: ShellHistory
<<<<<<< HEAD

    color_map_updates: ColorMapUpdates
    color_map_pending: bool

    control_map_updates: ControlMapUpdates
    control_map_pending: bool

    pos_map_updates: PosMapUpdates
    pos_map_pending: bool
=======
>>>>>>> f9bf97e (add basic structure)
