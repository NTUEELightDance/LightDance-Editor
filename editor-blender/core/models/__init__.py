from asyncio import Task
from dataclasses import dataclass
from enum import Enum
from typing import Any

import bpy

ID = int

ColorName = str
LEDEffectName = str
ColorCode = str
RGB = tuple[int, int, int]
RGBA = tuple[int, int, int, int]
LEDEffectID = int
ColorID = int


@dataclass
class Color:
    id: int
    name: ColorName
    color_code: ColorCode
    rgb: RGB


ColorMap = dict[ColorID, Color]


@dataclass
class LEDBulbData:
    color_id: ColorID
    alpha: int
    rgb: RGB | None = None  # for calculating fade


@dataclass
class LEDEffect:
    id: LEDEffectID
    name: LEDEffectName
    effect: list[LEDBulbData]


LEDEffectIDTable = dict[LEDEffectID, LEDEffect]

PartName = str
DancerName = str

LEDModelName = str
LEDPartName = str

LEDMap = dict[LEDModelName, dict[LEDPartName, dict[LEDEffectName, LEDEffect]]]

MapID = int


@dataclass
class LEDData:
    effect_id: LEDEffectID
    alpha: int


@dataclass
class FiberData:
    color_id: ColorID
    alpha: int


PartData = LEDData | FiberData
DancerStatus = dict[PartName, PartData]


@dataclass
class Revision:
    meta: int
    data: int


ControlMapStatus = dict[DancerName, DancerStatus]


@dataclass
class ControlMapElement:
    start: int
    fade: bool
    rev: Revision
    status: ControlMapStatus


ControlMap = dict[MapID, ControlMapElement]

ControlRecord = list[MapID]

ControlStartRecord = list[int]


@dataclass
class Location:
    x: float
    y: float
    z: float


@dataclass
class Rotation:
    rx: float
    ry: float
    rz: float


@dataclass
class Position:
    location: Location
    rotation: Rotation


PosMapStatus = dict[DancerName, Position]


@dataclass
class PosMapElement:
    start: int
    rev: Revision
    pos: PosMapStatus


PosMap = dict[MapID, PosMapElement]

PosRecord = list[MapID]

PosStartRecord = list[int]


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


PartTypeMap = dict[PartName, PartType]
LEDPartLengthMap = dict[LEDPartName, int]


Dancers = dict[DancerName, list[PartName]]


@dataclass
class DancersArrayPartsItem:
    name: PartName
    type: PartType
    length: int | None


@dataclass
class DancersArrayItem:
    name: DancerName
    parts: list[DancersArrayPartsItem]


DancersArray = list[DancersArrayItem]


@dataclass
class DancerPartIndexMapItem:
    index: int
    parts: dict[PartName, int]


DancerPartIndexMap = dict[DancerName, DancerPartIndexMapItem]


@dataclass
class SelectedItem:
    selected: bool
    parts: list[tuple[PartName, PartType]]


Selected = dict[DancerName, SelectedItem]


class SelectedPartType(Enum):
    DANCER = 0
    FIBER = 1
    LED = 2
    MIXED_LIGHT = 3


@dataclass
class ColorMapUpdates:
    added: list[Color]
    updated: list[Color]
    deleted: list[ColorID]


@dataclass
class LEDMapUpdates:
    added: list[tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffect]]
    updated: list[tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffect]]
    deleted: list[tuple[LEDModelName, LEDPartName, LEDEffectName, LEDEffectID]]


@dataclass
class ControlMapUpdates:
    added: dict[MapID, ControlMapElement]
    updated: dict[MapID, tuple[int, ControlMapElement]]
    deleted: dict[MapID, int]


@dataclass
class PosMapUpdates:
    added: dict[MapID, PosMapElement]
    updated: dict[MapID, tuple[int, PosMapElement]]
    deleted: dict[MapID, int]


class FrameType(Enum):
    CONTROL = "CONTROL"
    POS = "POS"
    BOTH = "BOTH"


class SelectMode(Enum):
    DANCER_MODE = 0
    PART_MODE = 1


ModelName = str

Models = dict[ModelName, list[DancerName]]


@dataclass
class ModelsArrayItem:
    name: ModelName
    dancers: list[DancerName]


ModelsArray = list[ModelsArrayItem]


@dataclass
class ModelDancerIndexMapItem:
    index: int
    dancers: dict[DancerName, int]


ModelDancerIndexMap = dict[ModelName, ModelDancerIndexMapItem]


class CopiedType(Enum):
    NONE = 0
    CONTROL_FRAME = 1
    POS_FRAME = 2
    DANCER = 3
    PARTS = 4


@dataclass
class CopiedPartData:
    alpha: int
    color: str | None = None
    effect: str | None = None


@dataclass
class CopiedDancerData:
    name: DancerName
    model: ModelName
    parts: dict[PartName, CopiedPartData]


@dataclass
class Clipboard:
    type: CopiedType
    control_frame: ControlMapElement | None = None
    pos_frame: PosMapElement | None = None
    dancer: CopiedDancerData | None = None


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


RPiStatus = dict[str, RPiStatusItem]


@dataclass
class ShellTransaction:
    command: str
    output: str


ShellHistory = dict[str, list[ShellTransaction]]


@dataclass
class Preferences:
    auto_sync: bool
    follow_frame: bool
    show_waveform: bool
    show_nametag: bool


DancerPartObjectsMap = dict[
    DancerName, tuple[bpy.types.Object, dict[PartName, bpy.types.Object]]
]


@dataclass
class InitializationTemporaries:
    assets_load: dict[str, Any]
    dancer_models_hash: dict[str, str]
    dancer_model_update: dict[DancerName, bool]
    dancers_object_exist: dict[DancerName, bool]
    dancers_reset_animation: list[bool]


@dataclass
class State:
    running: bool
    sync: bool

    user_log: str

    preferences: Preferences

    logged_in: bool
    loading: bool
    partial_load_frames: tuple[int, int]
    playing: bool
    requesting: bool

    subscription_task: Task[None] | None
    init_editor_task: Task[None] | None
    command_task: Task[None] | None

    init_temps: InitializationTemporaries
    music_frame_length: int

    token: str
    username: str
    ready: bool

    control_map: ControlMap
    pos_map: PosMap

    control_record: ControlRecord
    control_start_record: ControlStartRecord
    pos_record: PosRecord
    pos_start_record: PosStartRecord

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

    edit_state: EditMode
    editor: Editor
    editing_data: EditingData
    shifting: bool
    local_view: bool

    selection_mode: SelectMode
    selected_obj_names: list[str]
    selected_obj_type: SelectedPartType | None

    clipboard: Clipboard

    models: Models
    model_names: list[ModelName]
    models_array: ModelsArray
    model_dancer_index_map: ModelDancerIndexMap

    dancers: Dancers
    dancer_names: list[DancerName]
    dancers_array: DancersArray
    dancer_part_index_map: DancerPartIndexMap

    part_type_map: PartTypeMap
    led_part_length_map: LEDPartLengthMap
    color_map: ColorMap

    rpi_status: RPiStatus
    shell_history: ShellHistory
    last_play_timestamp_ms: int

    color_map_updates: ColorMapUpdates
    color_map_pending: ColorMapPending

    control_map_updates: ControlMapUpdates
    control_map_pending: bool

    pos_map_updates: PosMapUpdates
    pos_map_pending: bool

    led_map_updates: LEDMapUpdates
    led_map_pending: LEDMapPending

    dancer_part_objects_map: DancerPartObjectsMap
