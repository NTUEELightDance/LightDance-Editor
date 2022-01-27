import {
  ControlMapType,
  ControlRecordType,
  posRecordType,
  lightPresetsType,
  posPresetsType,
} from "./globalSlice";
interface BLPARTSTYPE {
  [index: string]: {
    prefix: string;
    name: string;
    postfix: string;
  };
}
interface ELPARTS extends BLPARTSTYPE {}
interface LEDPARTS {
  [index: string]: {
    prefix: string;
    name: string;
    postfix: string[];
  };
}
export interface textureType {
  //refered to /data/texture.json
  BLPARTS: BLPARTSTYPE;
  ELPARTS: ELPARTSTYPE;
  LEDPARTS: LEDPARTTYPE;
}

interface dancerPARTs {
  [index: string]: {
    zIndex: number;
    width: number;
    height: number;
    x: number;
    y: number;
  };
}
interface dancerTextureElement {
  //refered to data/dancers
  BLPARTS: dancerPARTs;
  ELPARTS: dancerPARTs;
  LEDPARTS: dancerPARTs;
}
export interface dancerTexture {
  [index: string]: dancerTextureElement;
}

export interface loadType {
  // refered to /data/load.json""
  Music: string;
  Control: string;
  ControlMap: string;
  Position: string;
  LightPresets: string;
  PosPresets: string;
  PosPresets: string;
  Dancers: {
    prefix: string;
    postfix: string;
    names: string[];
  };
  Texture: string;
}
export interface loadState {
  init: boolean;
  music: string; // load music path
  load: any;
  control: ControlRecordType; // loaded control.json, may not be same as localStorage (this is for default)
  controlMap: ControlMapType; // loaded controlMap.json
  position: posRecordType; // loaded position.json, may not be same as localStorage (this is for default)
  lightPresets: lightPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  posPresets: posPresetsType; // loaded lightPresets.json, may not be same as localStorage (this is for default)
  dancers: dancerTexture;
  texture: textureType;
  dancerNames: string[]; // [name]
}
