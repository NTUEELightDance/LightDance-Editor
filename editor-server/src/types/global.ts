import { Model, ObjectId, Document, PopulatedDoc } from "mongoose";

export type ConnectionParam = {
  token: string;
};

export type DBModels = {
  [key: string]: Model<any>;
};

export type TContext = {
  db: DBModels;
  username: string;
};

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
  value: IControlValue;
  _id?: ObjectId;
}
export type IControlValue =
  | IELControlValue
  | ILEDControlValue
  | IFiberControlValue;
interface IELControlValue {
  value: number;
}
interface ILEDControlValue {
  src: string;
  alpha: number;
}
interface IFiberControlValue {
  color: string;
  alpha: number;
}
export interface IPosition {
  frame: PopulatedDoc<IPositionFrame & Document>;
  x?: number;
  y?: number;
  z?: number;
  _id?: ObjectId;
}
export interface IUser {
  username: string;
  password: string;
  generateToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
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
  controlFrames: TRedisControls;
  positionFrames: TRedisPositions;
  colorCode: string;
  _id?: ObjectId;
}
export interface ILEDEffectsEffect {
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
};
export type TPositionData = {
  [key: string]: {
    start: number;
    pos: {
      [key: string]: {
        x: number;
        y: number;
        z: number;
      };
    };
  };
};
export type TControlData = {
  [key: string]: {
    fade: boolean;
    start: number;
    status: {
      [key: string]: {
        [key: string]: TELControl | TLEDControl | TFiberControl;
      };
    };
  };
};
export type TELControl = {
  value: number;
};
export type TLEDControl = {
  src: string;
  alpha: number;
};
export type TFiberControl = {
  color: string;
  alpha: number;
};
export type TDancerData = {
  parts: TPartData[];
  name: string;
};
export type TPartData = {
  name: string;
  type: "EL" | "LED" | "FIBER";
};
export type TColorData = {
  [key: string]: string;
};
export type TExportLED = {
  [key: string]: TExportLEDPart;
};
export type TExportLEDPart = {
  [key: string]: {
    repeat: number;
    effects: TExportLEDEffects[];
  };
};
export type TExportLEDEffects = {
  effect: TExportLEDEffectsEffect[];
  start: number;
  fade: boolean;
};
export type TExportLEDEffectsEffect = {
  alpha: number;
  colorCode: string;
};

export type TRedisStore = {
  [key: string]: string;
};
export type TRedisControls = {
  [key: string]: TRedisControl;
};
export type TRedisControl = {
  fade: boolean;
  start: number;
  editing: string | undefined;
  status: TRedisControlStatus;
};
export type TRedisControlStatus = {
  [key: string]: {
    [key: string]: any;
  };
};
export type TRedisPositions = {
  [key: string]: TRedisPosition;
};
export type TRedisPosition = {
  start: number;
  editing: string | undefined;
  pos: TRedisPos;
};
export type TRedisPos = {
  [key: string]: {
    x: number;
    y: number;
    z: number;
  };
};

export type TColorMap = {
  [key: string]: string;
};
