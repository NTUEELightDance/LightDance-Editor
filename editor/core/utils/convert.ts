import type {
  ControlMap,
  PosMap,
  ControlMapPayload,
  PosMapPayload,
  DancerStatus,
  DancerStatusPayload,
  ControlMapStatus,
  FiberDataPayload,
  LEDDataPayload,
  PartType,
  PartData,
  CoordinatesPayload,
  PosMapStatus,
  Coordinates,
} from "@/core/models";

import { state } from "@/core/state";

export function toControlMap(payload: ControlMapPayload): ControlMap {
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

function toDancerStatus(payload: DancerStatusPayload[]): ControlMapStatus {
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
  payload: FiberDataPayload | LEDDataPayload
): PartData {
  if (partType === "LED") {
    const [src, alpha] = payload;
    return {
      src,
      alpha,
    };
  } else if (partType === "FIBER") {
    const [color, alpha] = payload;
    return {
      color,
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
