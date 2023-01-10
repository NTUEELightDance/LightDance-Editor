import { ReactiveVar } from "@apollo/client";
import { CONTROL_EDITOR, POS_EDITOR, IDLE, EDITING, ADDING, DANCER, PART, POSITION } from "@/constants";
import { Color } from "three";

export type id = string
export type index = number
export type DancerName = string
export type PartName = string
export type ColorName = string
export type ColorCode = string

/**
 * ControlRecord and ControlMap
 */
export type ControlRecord = id[] // array of all IDs , each correspondsto diff status

export type ControlMap = Record<id, ControlMapElement>

export interface ControlMapElement {
  start: number // frame's start time
  status: ControlMapStatus
  fade: boolean // if this frame fades to the next
}

export type ControlMapStatus = Record<DancerName, DancerStatus>

export type DancerStatus = Record<PartName, Fiber | El | LED>

export interface Fiber {
  color: string
  alpha: number // brightness
  colorCode?: Color // this is a three type Color, for doing color fade
}

export type El = number

export interface LED {
  src: string
  alpha: number
}

export type CurrentStatusDelta = Record<DancerName, Record<PartName, El | LED | Fiber>>

/**
 * PosRecord and PosMap
 */
export type PosRecord = id[] // array of all IDs , each correspondsto diff status

export type PosMap = Record<id, PosMapElement>

export interface PosMapElement {
  start: number
  pos: DancerCoordinates
}

export type DancerCoordinates = Record<DancerName, Coordinates>

export interface Coordinates {
  x: number
  y: number
  z: number
}

/**
 * Editing
 */
export type EditMode = IDLE | EDITING | ADDING
export type Editor = CONTROL_EDITOR | POS_EDITOR
export interface EditingData {
  start: number
  frameId: string
  index: number
}

/**
 * selected dancer and parts
 */
export type Selected = Record<string, {
  selected: boolean
  parts: string[]
}>

export type PartPayload = Record<string, string[]>

/**
 * selection mode
 */
export type SelectionMode = DANCER | PART | POSITION

/**
 * Dancer name with its parts
 */
interface DancerParts {
  name: DancerName
  parts: Part[]
}

/**
 * Part, includes its name and type
 */
interface Part {
  name: PartName
  type: PartType
}

/**
 * PartTypeMap
 */
export type PartTypeMap = Record<string, PartType>

// PartType
type PartType = "LED" | "FIBER" | "El"

/**
 * DancerType
 */
export type Dancers = Record<DancerName, PartName[]>

/**
 * ColorMap
 */
export type ColorMap = Record<ColorName, ColorCode>

/**
 * Led Effect Map, get from backend
 */
export type LedMap = Record<PartName, Record<LedEffectName, LedEffect>>

type LedEffectName = string

interface LedEffect {
  repeat: number // repeat counts, 0 for continuously repeat
  effects: LedEffectFrame[]
}

export interface LedEffectFrame {
  start: number
  fade: boolean
  effect: Array<{
    colorCode: ColorCode
    alpha: number
  }> // ColorCode array for led strips
}

/**
 * LedEffectRecord
 * Save dancer LED part's appearing record id
 * Generated from controlMap and controlRecord, but stripped out the `no-effect` source
 *
 */
type LedEffectRecord = Record<DancerName, Record<PartName, LedRecord>>

export type LedRecord = id[]

/**
 * CurrentLedEffect
 * Save the ledEffect index (in ledEffectRecord) and the effect
 * Get data from LedEffectRecord and LedMap
 * recordIndex indicates the place in LedEffectRecord
 * effectIndex indicates the place in the effect
 */
export type CurrentLedEffect = Record<DancerName, Record<PartName, {
  recordIndex: number
  effectIndex: number
  effect: Array<{
    colorCode: ColorCode
    alpha: number
  }> // this is to handle faded effect, so we will clone the effect from ledMap
}>>

export type EffectListType = Array<{
  start: number
  end: number
  description: string
  data: {
    control: Record<string, ControlMapElement>
    position: Record<string, PosMapElement>
  }
}>
/**
 * group errors
 */
export type AddNewGroupError = "EMPTY" | "EXISTED" | "INVALID" | "TYPE"

export type DeleteGroupError = "DNE"

export type EditGroupError = "DNE"

/**
 * Mutable State
 */
export interface State {
  isPlaying: boolean // isPlaying

  currentTime: number // current time
  currentControlIndex: number // current index in controlRecord
  currentPosIndex: number // current index in posRecord

  currentFade: boolean // current control Frame will fade to next
  currentStatus: ControlMapStatus // current dancers' status
  currentPos: DancerCoordinates // current dancers' position

  ledEffectRecord: LedEffectRecord
  currentLedEffect: CurrentLedEffect

  editMode: EditMode // IDLE | EDITING | ADDING
  editor: Editor // editor, should be CONTROL_EDITOR or POS_EDITOR
  editingData: EditingData // store the editingData's start time id and index

  selected: Selected // array of selected dancer's name

  selectionMode: SelectionMode // selection mode used by simulator and dancer tree

  dancers: Dancers
  dancerNames: DancerName[]
  partTypeMap: PartTypeMap
  colorMap: ColorMap

  effectList: EffectListType
}

export type StateKey = keyof State

/**
 * Reactive State, can trigger react component
 */
export interface ReactiveState extends Record<StateKey, any> {
  isPlaying: ReactiveVar<boolean> // isPlaying

  currentTime: ReactiveVar<number> // current time
  currentControlIndex: ReactiveVar<number> // current index in controlRecord
  currentPosIndex: ReactiveVar<number> // current index in posRecord

  currentFade: ReactiveVar<boolean> // current control Frame will fade to next
  currentStatus: ReactiveVar<ControlMapStatus> // current dancers' status
  currentPos: ReactiveVar<DancerCoordinates> // current dancers' position

  ledEffectRecord: ReactiveVar<LedEffectRecord>
  currentLedEffect: ReactiveVar<CurrentLedEffect>

  editMode: ReactiveVar<EditMode>
  editor: ReactiveVar<Editor>
  editingData: ReactiveVar<EditingData>

  selected: ReactiveVar<Selected> // array of selected dancer's name

  selectionMode: ReactiveVar<SelectionMode> // selection mode used by simulator and dancer tree

  dancers: ReactiveVar<Dancers>
  dancerNames: ReactiveVar<DancerName[]>
  partTypeMap: ReactiveVar<PartTypeMap>
  colorMap: ReactiveVar<ColorMap>

  effectList: ReactiveVar<EffectListType>
}
