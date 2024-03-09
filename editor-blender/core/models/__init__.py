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
class LEDBulbData:
    color_id: ColorID
    alpha: int
    rgb: Optional[RGB] = None  # for calculating fade


@dataclass
class LEDEffect:
    id: LEDEffectID
    name: LEDEffectName
    effect: List[LEDBulbData]


LEDEffectIDTable = Dict[LEDEffectID, LEDEffect]

PartName = str
DancerName = str

LEDModelName = str
LEDPartName = str

LEDMap = Dict[LEDModelName, Dict[LEDPartName, Dict[LEDEffectName, LEDEffect]]]

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


@dataclass
class Revision:
    meta: int
    data: int


ControlMapStatus = Dict[DancerName, DancerStatus]


@dataclass
class ControlMapElement:
    start: int
    fade: bool
    rev: Revision
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
    rev: Revision
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
class LEDMapUpdates:
    added: List[Tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffect]]
    updated: List[Tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffect]]
    deleted: List[Tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffectID]]


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


class FrameType(Enum):
    CONTROL = "CONTROL"
    POS = "POS"
    BOTH = "BOTH"


class SelectMode(Enum):
    DANCER_MODE = 0
    PART_MODE = 1


ModelName = str

Models = Dict[ModelName, List[DancerName]]


@dataclass
class ModelsArrayItem:
    name: ModelName
    dancers: List[DancerName]


ModelsArray = List[ModelsArrayItem]


@dataclass
class ModelDancerIndexMapItem:
    index: int
    dancers: Dict[DancerName, int]


ModelDancerIndexMap = Dict[ModelName, ModelDancerIndexMapItem]


class CopiedType(Enum):
    NONE = 0
    CONTROL_FRAME = 1
    POS_FRAME = 2
    DANCER = 3
    PARTS = 4


@dataclass
class CopiedPartData:
    alpha: int
    color: Optional[str] = None
    effect: Optional[str] = None


@dataclass
class CopiedDancerData:
    name: DancerName
    model: ModelName
    parts: Dict[PartName, CopiedPartData]


@dataclass
class Clipboard:
    type: CopiedType
    control_frame: Optional[ControlMapElement] = None
    pos_frame: Optional[PosMapElement] = None
    dancer: Optional[CopiedDancerData] = None


@dataclass
class ColorMapPending:
    add_or_delete: bool
    update: bool


@dataclass
class LEDMapPending:
    add_or_delete: bool
    update: bool


@dataclass
class InterfaceStatus:
    name: str
    IP: str
    MAC: str
    connected: bool
    message: str
    statusCode: int


@dataclass
class RPiStatusItem:
    ethernet: InterfaceStatus
    wifi: InterfaceStatus


RPiStatus = Dict[str, RPiStatusItem]


@dataclass
class ShellTransaction:
    command: str
    output: str


ShellHistory = Dict[str, List[ShellTransaction]]


@dataclass
class State:
    running: bool
    sync: bool

    init_message: str

    logged_in: bool
    playing: bool
    requesting: bool

    subscription_task: Optional[Task[None]]
    init_editor_task: Optional[Task[None]]
    command_task: Optional[Task[None]]

    assets_path: str

    token: str
    username: str
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
    shifting: bool
    local_view: bool

    selection_mode: SelectMode
    selected_obj_names: List[str]
    selected_obj_type: Optional[SelectedPartType]

    clipboard: Clipboard

    # TODO: Add these
    # current_led_effect_reference_dancer: Optional[DancerName]  # the dancer whose LED part is being edited
    # current_led_partName: Optional[LEDPartName]  # the LED part whose effect is being edited
    # current_led_effect_name: Optional[LEDEffectName]  # the LED effect name being edited
    # current_led_effect_start: int  # the start time on the timeline where currentLEDEffect is displayed during editing
    # current_led_effect: Optional[LEDEffect]  # the LED effect being edited

    models: Models
    model_names: List[ModelName]
    models_array: ModelsArray
    model_dancer_index_map: ModelDancerIndexMap

    dancers: Dancers
    dancer_names: List[DancerName]
    dancers_array: DancersArray
    dancer_part_index_map: DancerPartIndexMap

    part_type_map: PartTypeMap
    led_part_length_map: LEDPartLengthMap
    color_map: ColorMap
    # effect_list: EffectListType

    rpi_status: RPiStatus
    shell_history: ShellHistory

    color_map_updates: ColorMapUpdates
    color_map_pending: ColorMapPending

    control_map_updates: ControlMapUpdates
    control_map_pending: bool

    pos_map_updates: PosMapUpdates
    pos_map_pending: bool

    led_map_updates: LEDMapUpdates
    led_map_pending: LEDMapPending
