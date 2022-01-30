import {
	ControlMapType,
	ControlRecordType,
	posRecordType,
	LightPresetsType,
	PosPresetsType,
	EffectRecordMapType,
	EffectStatusMapType,
} from "./globalSlice";
interface BlPartsType {
	[index: string]: {
		prefix: string;
		name: string;
		postfix: string;
	};
}
interface ElPartsType extends BlPartsType {}
interface LedPartsType {
	[index: string]: {
		prefix: string;
		name: string;
		postfix: string[];
	};
}
export interface TextureType {
	//refered to /data/texture.json
	BLPARTS: BlPartsType;
	ELPARTS: ElPartsType;
	LEDPARTS: LedPartsType;
}

interface DancerParts {
	[index: string]: {
		zIndex: number;
		width: number;
		height: number;
		x: number;
		y: number;
	};
}
interface DancerType {
	//refered to data/dancers
	BLPARTS: DancerParts;
	ELPARTS: DancerParts;
	LEDPARTS: DancerParts;
}
export interface DancersType {
	[index: string]: DancerType;
}

export interface LoadType {
	// refered to /data/load.json""
	Music: string;
	Control: string;
	ControlMap: string;
	Position: string;
	LightPresets: string;
	PosPresets: string;
	EffectRecordMap: string;
	EffectStatueMap: string;
	Dancers: {
		prefix: string;
		postfix: string;
		names: string[];
	};
	Texture: string;
}
export interface LoadState {
	init: boolean;
	music: string; // load music path
	load: LoadType;
	control: ControlRecordType; // loaded control.json, may not be same as localStorage (this is for default)
	controlMap: ControlMapType; // loaded controlMap.json
	position: PosRecordType; // loaded position.json, may not be same as localStorage (this is for default)
	lightPresets: LightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
	posPresets: PosPresetsType; // loaded posPresets.json, may not be same as localStorage (this is for default)
	effectRecordMap: EffectRecordMapType; // loaded effectRecord.json
	effectStatusMap: EffectStatusMapType; // loaded effectStatus.json
	dancers: DancersType;
	texture: TextureType;
	dancerNames: string[]; // [name]
}
