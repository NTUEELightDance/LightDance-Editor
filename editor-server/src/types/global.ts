import { PrismaClient } from "@prisma/client";

export interface ConnectionParam extends Record<string, unknown> {
  token: string;
}

export type TContext = {
  userId: number;
  username: string;
  prisma: PrismaClient;
};

export interface LooseObject {
  [key: string]: any;
}
export interface IPart {
  name: string;
  type: string;
  controlData: IControl[];
  id: number;
}

export interface IControl {
  frame: IControlFrame;
  value: IControlValue;
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

export interface IControlFrame {
  fade: boolean;
  start: number;
  editing?: string;
  id: string;
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
}

// export data
export type TExportData = {
  position: TPositionData;
  control: TControlData;
  // control: TControlDataTest
  dancer: TDancerData[];
  color: TColorData;
  LEDEffects: TExportLED;
};
export type TPositionData = {
  [key: string]: {
    start: number;
    pos: TPositionPos[];
  };
};
export type TPositionDataTest = {
  [key: string]: {
    start: number;
    pos: TPositionPos[];
  };
};
export type TPositionPos = [x: number, y: number, z: number];
export type TControlData = {
  [key: string]: {
    fade: boolean;
    start: number;
    status: (TELControl | TLEDControl | TFiberControl)[][];
  };
};

export type TELControl = [value: number];
export type TLEDControl = [src: string, alpha: number];
export type TFiberControl = [color: string, alpha: number];
export type TPartControl = TELControl | TLEDControl | TFiberControl;

export type TDancerData = {
  parts: TPartData[];
  positionData?: TPositionData[];
  name: string;
};
export type TPartData = {
  name: string;
  type: "LED" | "FIBER";
  length: number | null;
  // missing 'EL' in prisma schema
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
    // effects: TExportLEDEffects[]
    frames: TExportLEDFrame[];
  };
};
export type TExportLEDFrame = {
  // effect: TExportLEDEffectsEffect[]
  LEDs: TExportLEDFrameLED[];
  start: number;
  fade: boolean;
};
export type TExportLEDFrameLED = [r: number, g: number, b: number, a: number];

export type TRedisStore = {
  [key: string]: string;
};
export type TRedisControls = {
  [key: string]: TRedisControl;
};
// export type TRedisControl = {
//   fade: boolean;
//   start: number;
//   editing: number | undefined;
//   status: TRedisControlStatus
// }
export type TRedisControl = {
  fade: boolean;
  start: number;
  editing: string | undefined;
  status: TPartControl[][];
};
export type TRedisControlStatus = {
  [key: string]: {
    [key: string]: any;
  };
};
export type TRedisPositions = {
  [key: string]: TRedisPosition;
};
// export type TRedisPosition = {
//   start: number
//   editing: string | undefined
//   pos: TRedisPos
// }
export type TRedisPosition = {
  start: number;
  editing: string | undefined;
  pos: TPositionPos[];
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
