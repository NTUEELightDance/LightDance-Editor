import {
  ControlMapType,
  ControlRecordType,
  PosRecordType,
  PosMapType,
  LightPresetsType,
  PosPresetsType,
  EffectRecordMapType,
  EffectStatusMapType,
} from "./globalSlice";
interface BlPartType {
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
  BLPARTS: BlPartType;
  ELPARTS: ElPartsType;
  LEDPARTS: LedPartsType;
}

interface DancerPartType {
  [index: string]: {
    zIndex: number;
    width: number;
    height: number;
    x: number;
    y: number;
  };
}
interface DancerParts {
  //refered to data/dancers
  BLPARTS: DancerPartType;
  ELPARTS: DancerPartType;
  LEDPARTS: DancerPartType;
}
export interface DancersType {
  [index: string]: DancerParts; //dancerName : dancer parts
}

export interface LoadType {
  // refered to /data/load.json""
  Music: string;
  Control: string;
  ControlMap: string;
  Position: string;
  PosMap: string;
  LightPresets: string;
  PosPresets: string;
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
  posMap: PosMapType; // loaded position.json, may not be
  lightPresets: LightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  posPresets: PosPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  effectRecordMap: EffectRecordMapType; // loaded effectRecord.json
  effectStatusMap: EffectStatusMapType; // loaded effectStatus.json
  dancers: DancersType;
  texture: TextureType;
  dancerNames: string[]; // [name]
}
