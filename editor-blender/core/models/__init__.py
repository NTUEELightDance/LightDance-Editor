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
    rgb: Optional[RGB]  # for calculating fade


@dataclass
class LEDEffectFrame:
    start: int
    fade: bool
    effect: List[LEDBuldData]


@dataclass
class LEDEffect:
    id: LEDEffectID
    name: LEDEffectName
    repeat: int
    effects: List[LEDEffectFrame]


LEDEffectIDTable = Dict[LEDEffectID, LEDEffect]

PartName = str
DancerName = str

LEDPartName = str

LEDMap = Dict[LEDPartName, Dict[LEDEffectName, LEDEffect]]

MapID = int


@dataclass
class LEDData:
    effect_id: LEDEffectID
    alpha: int


@dataclass
class FiberData:
    color_id: ColorID
    alpha: int


PartData = Union[LEDData, FiberData]
DancerStatus = Dict[PartName, PartData]

ControlMapStatus = Dict[DancerName, DancerStatus]


@dataclass
class ControlMapElement:
    start: int
    fade: bool
    status: ControlMapStatus


ControlMap = Dict[MapID, ControlMapElement]

ControlRecord = List[MapID]


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

PosRecord = List[MapID]


class EditMode(Enum):
    IDLE = 0
    EDITING = 1


class Editor(Enum):
    CONTROL_EDITOR = 0
    POS_EDITOR = 1
    LED_EDITOR = 2


@dataclass
class EditingData:
    start: int
    frame_id: int
    index: int


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
    parts: List[PartName]


Selected = Dict[DancerName, SelectedItem]


@dataclass
class State:
    is_running: bool
    is_logged_in: bool
    is_playing: bool

    subscription_task: Optional[Task[None]]
    init_editor_task: Optional[Task[None]]

    token: str
    ready: bool

    control_map: ControlMap
    pos_map: PosMap

    control_record: ControlRecord
    pos_record: PosRecord

    led_map: LEDMap
    led_effect_id_table: LEDEffectIDTable

    current_control_index: int
    current_pos_index: int
    current_led_index: int

    # NOTE: Maybe we don't need these
    current_fade: bool
    current_status: ControlMapStatus
    current_pos: PosMapStatus

    current_editing_frame: int
    current_editing_detached: bool
    current_editing_frame_synced: bool

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
    selected: Selected
    # selected_leds: List[int]

    # TODO: Add these
    # current_led_effect_reference_dancer: Optional[DancerName]  # the dancer whose LED part is being edited
    # current_led_partName: Optional[LEDPartName]  # the LED part whose effect is being edited
    # current_led_effect_name: Optional[LEDEffectName]  # the LED effect name being edited
    # current_led_effect_start: int  # the start time on the timeline where currentLEDEffect is displayed during editing
    # current_led_effect: Optional[LEDEffect]  # the LED effect being edited

    # TODO: Add these
    dancers: Dancers
    dancer_names: List[DancerName]
    part_type_map: PartTypeMap
    led_part_length_map: LEDPartLengthMap
    color_map: ColorMap
    # effect_list: EffectListType

    # TODO: Add these
    dancers_array: DancersArray
    dancer_part_index_map: DancerPartIndexMap

    # TODO: Add these
    # rpi_status: RPiStatus
    # shell_history: ShellHistory
