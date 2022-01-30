interface Fiber {
	color: string;
	alpha: number; //brightness
}

type El = number;
export interface LED {
	src: string;
	alpha: number;
}

interface DancerStatus {
	[index: string]: Fiber | El | LED; //partNames: partStatus
}

export interface ControlMapStatus {
	[index: string]: DancerStatus; //dancerNames :  dancerStatus
}

export interface ControlMapElement {
	start: number; //frame's start time
	status: ControlMapStatus;
	fade: boolean; // if this frame fades to the next
}
interface TimeDataType {
	from: string; // update from what component (input bar, or waveSurferApp cursor)
	time: number; // time
	controlFrame: number; // control frame's index
	posFrame: number; // positions' index
}
export interface DancerCoordinates {
	//dance: coordinates
	[index: string]: {
		x: number;
		y: number;
		z: number;
	};
}

interface LightPresetsElement {
	name: string; // ID named by user
	status: ControlMapStatus;
}
interface PosPresetsElement {
	name: string;
	pos: DancerCoordinates;
}
export type LightPresetsType = LightPresetsElement[];
export type PosPresetsType = PosPresetsElement[];

export type PosRecordType = string[]; // array of all IDs , each correspondsto diff status
export type ControlRecordType = string[]; // array of all IDs , each correspondsto diff status

export interface ControlMapType {
	[index: string]: ControlMapElement;
}

//  for effect list
type EffectRecordType = string[];

interface EffectRecordMapType {
	[index: string]: EffectRecordType; // effectName: effectRecord
}

export interface EffectStatusType {
	[index: string]: DancerStatus; //dancerNames :  dancerStatus
}

interface EffectStatueMapElementType {
	start: number;
	status: EffectStatus;
	fade: boolean; // if this frame fades to the next
}

export interface EffectStatusMapType {
	[index: string]: EffectStatueMapElementType;
}

export interface PosMapType {
	//IDs: {start, pos}
	[index: string]: {
		start: number;
		pos: DancerCoordinates;
	};
}
export interface GlobalState {
	isPlaying: boolean; // isPlaying
	selected: string[]; // array of selected dancer's name
	currentFade: boolean; // current control Frame will fade to next
	currentStatus: ControlMapStatus; // current dancers' status
	currentPos: DancerCoordinates; // currnet dancers' position
	controlRecord: ControlRecordType; // array of all IDs , each correspondsto diff status
	controlMap: ControlMapType;
	posRecord: PosRecordType; // array of all dancer's pos
	posMap: PosMapType;
	timeData: TimeDataType;
	mode: number; // 0: nothing, 1: edit, 2: add
	effectRecordMap: EffectRecordMapType; // map of all effects and corresponding record ID array
	effectStatusMap: EffectStatusMapType; // map of effect record ID and its status
	lightPresets: LightPresetsType;
	posPresets: PosPresetsType;
}
