import { Color } from "three";

import memoize from "lodash/memoize";

import type {
  ControlMap,
  PosMap,
  ControlMapQueryPayload,
  PosMapPayload,
  DancerStatus,
  DancerStatusQueryPayload,
  ControlMapStatus,
  FiberDataQueryPayload,
  LEDDataQueryPayload,
  PartType,
  PartData,
  CoordinatesPayload,
  PosMapStatus,
  Coordinates,
  ControlMapStatusMutationPayload,
  DancerStatusMutationPayload,
  RGB,
  ColorCode,
  LEDEffectPayload,
  LEDEffectFramePayload,
  LEDEffectFrame,
  LEDEffect,
  LEDMapPayload,
  LEDMap,
  LEDPartName,
  LEDEffectIDtable,
  ColorID,
  ColorMap,
} from "@/core/models";

import { isColorCode, isFiberData, isLEDData } from "@/core/models";

import { state } from "@/core/state";
import { ColorQueryResponseData } from "@/graphql";

export function toControlMap(payload: ControlMapQueryPayload): ControlMap {
  const controlMap: ControlMap = {};
  for (const frameId in payload) {
    const { fade, start, status } = payload[frameId];
    controlMap[frameId] = {
      fade,
      start,
      status: toDancerStatus(status),
    };
  }
  return controlMap;
}

function toDancerStatus(payload: DancerStatusQueryPayload[]): ControlMapStatus {
  const status: ControlMapStatus = {};

  payload.forEach((dancerStatusPayload, dancerIndex) => {
    const dancerName = state.dancersArray[dancerIndex].name;
    const dancerStatus: DancerStatus = {};

    dancerStatusPayload.forEach((partStatusPayload, partIndex) => {
      const partName = state.dancersArray[dancerIndex].parts[partIndex].name;
      const partType = state.partTypeMap[partName];

      dancerStatus[partName] = toPartData(partType, partStatusPayload);
    });

    status[dancerName] = dancerStatus;
  });

  return status;
}

function toPartData(
  partType: PartType,
  payload: FiberDataQueryPayload | LEDDataQueryPayload
): PartData {
  if (partType === "LED") {
    const [effectID, alpha] = payload;
    return {
      effectID,
      alpha,
    };
  } else if (partType === "FIBER") {
    const [colorID, alpha] = payload;
    return {
      colorID,
      alpha,
    };
  } else {
    throw new Error("Invalid part type");
  }
}

export function toPosMap(payload: PosMapPayload): PosMap {
  const posMap: PosMap = {};
  for (const frameId in payload) {
    const { start, pos } = payload[frameId];
    posMap[frameId] = {
      start,
      pos: toPosMapStatus(pos),
    };
  }
  return posMap;
}

function toPosMapStatus(payload: CoordinatesPayload[]): PosMapStatus {
  const pos: PosMapStatus = {};
  payload.forEach((coordinatesPayload, dancerIndex) => {
    const dancerName = state.dancersArray[dancerIndex].name;
    pos[dancerName] = toCoordinates(coordinatesPayload);
  });
  return pos;
}

function toCoordinates(payload: CoordinatesPayload): Coordinates {
  return {
    x: payload[0],
    y: payload[1],
    z: payload[2],
  };
}

function getDancerIndex(dancerName: string): number {
  return state.dancerPartIndexMap[dancerName].index;
}

function getPartIndex(dancerName: string, partName: string): number {
  return state.dancerPartIndexMap[dancerName].parts[partName];
}

export function toControlMapStatusMutationPayload(
  status: ControlMapStatus
): ControlMapStatusMutationPayload {
  const payload: ControlMapStatusMutationPayload = [];
  for (const dancerName in status) {
    const dancerStatusPayload: DancerStatusMutationPayload = [];
    const dancerStatus = status[dancerName];
    for (const partName in dancerStatus) {
      const partData = dancerStatus[partName];
      dancerStatusPayload[getPartIndex(dancerName, partName)] =
        toPartDataMutationPayload(partData);
    }
    payload[getDancerIndex(dancerName)] = dancerStatusPayload;
  }
  return payload;
}

function toPartDataMutationPayload(
  partData: PartData
): FiberDataQueryPayload | LEDDataQueryPayload {
  if (isFiberData(partData)) {
    return [partData.colorID, partData.alpha];
  } else if (isLEDData(partData)) {
    return [partData.effectID, partData.alpha];
  }
  throw new Error("Invalid part data");
}

export function toPosMapStatusPayload(pos: PosMapStatus): CoordinatesPayload[] {
  const payload: CoordinatesPayload[] = [];
  for (const dancerName in pos) {
    const coordinates = pos[dancerName];
    payload[getDancerIndex(dancerName)] = toCoordinatesPayload(coordinates);
  }
  return payload;
}

export function toCoordinatesPayload(
  coordinates: Coordinates
): CoordinatesPayload {
  return [coordinates.x, coordinates.y, coordinates.z];
}

export function toLEDMap(mapPayload: LEDMapPayload): LEDMap {
  const ledMap: LEDMap = {};
  for (const [partName, effectPayloadMap] of Object.entries(mapPayload)) {
    ledMap[partName as LEDPartName] = {};
    for (const [effectName, payload] of Object.entries(effectPayloadMap)) {
      ledMap[partName as LEDPartName][effectName] = toLEDEffect(
        payload,
        effectName
      );
    }
  }
  return ledMap;
}

export function toLEDEffectIDTable(
  mapPayload: LEDMapPayload
): LEDEffectIDtable {
  const ledEffectIDtable: LEDEffectIDtable = {};
  for (const effectPayloadMap of Object.values(mapPayload)) {
    for (const [effectName, payload] of Object.entries(effectPayloadMap)) {
      ledEffectIDtable[payload.id] = toLEDEffect(payload, effectName);
    }
  }

  return ledEffectIDtable;
}

export function toLEDEffect(
  payload: LEDEffectPayload,
  effectName: string
): LEDEffect {
  const effects = payload.frames.map((framePayload) =>
    toLEDEffectFrame(framePayload)
  );

  return {
    name: effectName,
    effectID: payload.id,
    repeat: payload.repeat,
    effects,
  };
}

export function toLEDEffectFrame(
  framePayload: LEDEffectFramePayload
): LEDEffectFrame {
  const effect = framePayload.LEDs.map(([colorID, alpha]) => {
    return {
      colorID,
      alpha,
    };
  });
  const frame: LEDEffectFrame = {
    start: framePayload.start,
    fade: framePayload.fade,
    effect,
  };
  return frame;
}

export function toLEDEffectFramePayload(
  frame: LEDEffectFrame
): LEDEffectFramePayload {
  const LEDs: [ColorID, number][] = frame.effect.map(({ colorID, alpha }) => [
    colorID,
    alpha,
  ]);
  return {
    start: frame.start,
    fade: frame.fade,
    LEDs,
  };
}

const COLOR = new Color();

export const hexToRGB = memoize((hex: string) => {
  COLOR.setHex(parseInt(hex.replace(/^#/, ""), 16));
  return COLOR.toArray().map((v) => Math.round(v * 255)) as RGB;
});

export function rgbToHex(rgb: RGB): ColorCode {
  COLOR.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
  const colorCode = "#" + COLOR.getHexString();
  if (isColorCode(colorCode)) {
    return colorCode;
  }
  throw new Error(`Invalid color code: ${colorCode}`);
}

export function toColorMap(payload: ColorQueryResponseData): ColorMap {
  const colorMap: ColorMap = Object.entries(payload).reduce(
    (acc, [id, { color: name, colorCode: rgb }]) => {
      return {
        ...acc,
        [id]: {
          id: parseInt(id),
          name,
          colorCode: rgbToHex(rgb),
          rgb,
        },
      };
    },
    {} as ColorMap
  );

  return colorMap;
}
