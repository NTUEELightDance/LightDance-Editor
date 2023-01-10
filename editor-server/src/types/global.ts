import { Model, ObjectId, Document, PopulatedDoc } from "mongoose";
import { ControlFrame } from "../resolvers/types/controlFrame";

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
  position: any;
  control: any;
  dancer: any;
  color: any;
}

