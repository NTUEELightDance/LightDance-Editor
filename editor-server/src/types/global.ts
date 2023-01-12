import { Model, ObjectId, Document, PopulatedDoc } from "mongoose";

export interface ConnectionParam{
    userID: string;
    name: string;
}

export type DBModels = {
    [key: string]: Model<any>;
}

export type TContext = {
    db: DBModels;
    userID: string;
}

export interface LooseObject {
  [key: string]: any;
}

// data type
export interface IControlFrame {
  fade: boolean;
  start: number;
  editing?: string;
  id: string;
  _id?: ObjectId;
}
export interface IPositionFrame {
  start: number;
  editing?: string;
  id: string;
  _id?: ObjectId;
}
export interface IDancer {
  name: string;
  parts: PopulatedDoc<IPart & Document>[];
  positionData: PopulatedDoc<IPosition & Document>[];
  id: string;
  _id?: ObjectId;
}
export interface IPart {
  name: string;
  type: string;
  controlData: PopulatedDoc<IControl & Document>[];
  id: string;
  _id?: ObjectId;
}
export interface IControl {
  frame: PopulatedDoc<IControlFrame & Document>;
  value: LooseObject;
  _id?: ObjectId;
}
export interface IPosition {
  frame: PopulatedDoc<IPositionFrame & Document>;
  x?: number;
  y?: number;
  z?: number;
  _id?: ObjectId;
}
export interface IUser {
  userID: string;
  name: string;
  _id?: ObjectId;
}
export interface IColor {
  color: string;
  colorCode: string;
  _id?: ObjectId;
}
export interface IEffectList {
  color: string;
  start: number;
  end: number;
  description: string;
  controlFrames: LooseObject;
  positionFrames: LooseObject;
  colorCode: string;
  _id?: ObjectId;
}
export interface ILEDEffectsEffect{
  colorCode: string;
  alpha: number;
}
export interface ILEDEffects {
  start: number;
  fade: boolean;
  effect: ILEDEffectsEffect[];
}
export interface ILED {
  partName: string;
  effectName: string;
  repeat: number;
  effects: ILEDEffects[];
  _id?: ObjectId;
}
export interface ILogger {
  user: string;
  variableValues: LooseObject;
  type: string;
  fieldName: string;
  time: Date;
  status: string;
  errorMessage?: LooseObject;
  result?: LooseObject; 
  _id?: ObjectId;
}

// export data
export type TExportData = {
  position: TPositionData;
  control: TControlData;
  dancer: TDancerData[];
  color: TColorData;
}
export type TPositionData = {
  [key: string]: {
    start: number;
    pos: {
      [key: string]: {
        x: number;
        y: number;
        z: number;
      }
    }
  }
};
export type TControlData = {
  [key: string]: {
    fade: boolean;
    start: number;
    status: {
      [key: string]: {
        [key: string]: TELControl | TLEDControl | TFiberControl
      }
    }
  }
};
export type TELControl = {
  value: number;
}
export type TLEDControl = {
  src: string;
  alpha: number;
}
export type TFiberControl = {
  color: string;
  alpha: number;
}
export type TDancerData = {
  parts: TPartData[];
  name: string;
}
export type TPartData = {
  name: string;
  type: "EL" | "LED" | "FIBER";
}
export type TColorData = {
  [key: string]: string;
}
export type TExportLED = {
  [key: string]: TExportLEDPart;
}
export type TExportLEDPart = {
  [key: string]: {
    repeat: number;
    effects: TExportLEDEffects[];
  }
}
export type TExportLEDEffects = {
  effect: TExportLEDEffectsEffect[];
  start: number;
  fade: boolean;
}
export type TExportLEDEffectsEffect = {
  alpha: number;
  colorCode: string;
}

// export type TControlMap = {
//   frames: {
//     [key: string]: {
//       fade: boolean;
//       start: number;
//       status: {
//         [key: string]: {
//           [key: string]: number;
//         }
//       }
//     }
//   }
// }

export type TRedisStore = {
  [key: string]: string;
}
export type TRedisPos = {
  [key: string]: {
    x: number;
    y: number;
    z: number;
  }
}