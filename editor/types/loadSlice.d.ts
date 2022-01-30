import {
	ControlMapType,
	ControlRecordType,
<<<<<<< HEAD
	posRecordType,
	LightPresetsType,
	PosPresetsType,
	EffectRecordMapType,
	EffectStatusMapType,
} from "./globalSlice";
interface BlPartsType {
=======
	PosRecordType,
	PosMapType,
	LightPresetsType,
	PosPresetsType,
} from "./globalSlice";
interface BlPartType {
>>>>>>> new position format done
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
<<<<<<< HEAD
	BLPARTS: BlPartsType;
	ELPARTS: ElPartsType;
	LEDPARTS: LedPartsType;
}

interface DancerParts {
=======
	BLPARTS: BlPartType;
	ELPARTS: ElPartsType;
	LEDPARTS: BlPartsType;
}

interface DancerPartType {
>>>>>>> new position format done
	[index: string]: {
		zIndex: number;
		width: number;
		height: number;
		x: number;
		y: number;
	};
}
<<<<<<< HEAD
interface DancerType {
	//refered to data/dancers
	BLPARTS: DancerParts;
	ELPARTS: DancerParts;
	LEDPARTS: DancerParts;
}
export interface DancersType {
	[index: string]: DancerType;
=======
interface DancParts {
	//refered to data/dancers
	BLPARTS: DancerPartType;
	ELPARTS: DancerPartType;
	LEDPARTS: DancerPartType;
}
export interface DancersType {
	[index: string]: DancParts; //dancerName : dancer parts
>>>>>>> new position format done
}

export interface LoadType {
	// refered to /data/load.json""
	Music: string;
	Control: string;
	ControlMap: string;
	Position: string;
<<<<<<< HEAD
	LightPresets: string;
	PosPresets: string;
	EffectRecordMap: string;
	EffectStatueMap: string;
=======
	PosMap: string;
	LightPresets: string;
	PosPresets: string;
	PosPresets: string;
>>>>>>> new position format done
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
<<<<<<< HEAD
	lightPresets: LightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
	posPresets: PosPresetsType; // loaded posPresets.json, may not be same as localStorage (this is for default)
	effectRecordMap: EffectRecordMapType; // loaded effectRecord.json
	effectStatusMap: EffectStatusMapType; // loaded effectStatus.json
=======
	posMap: PosMapType; // loaded position.json, may not be
	lightPresets: LightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
	posPresets: PosPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
>>>>>>> new position format done
	dancers: DancersType;
	texture: TextureType;
	dancerNames: string[]; // [name]
}
