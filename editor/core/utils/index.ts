import { controlAgent, posAgent, ledAgent } from "@/api";
import { reactiveState, state } from "@/core/state";
import { LEDPartName } from "../models";

/**
 * Get [posMap, posRecord] from posAgent
 */
export async function getPosPayload() {
  return await Promise.all([
    posAgent.getPosMapPayload(),
    posAgent.getPosRecord(),
  ]);
}

/**
 * Get [controlMap, controlRecord] from controlAgent
 */
export async function getControlPayload() {
  return await Promise.all([
    controlAgent.getControlMapPayload(),
    controlAgent.getControlRecord(),
  ]);
}

export async function getControl() {
  const results = await Promise.allSettled([
    controlAgent.getControlMapPayload(),
    controlAgent.getControlRecord(),
  ]);

  if (results[0].status === "rejected") {
    throw results[0].reason;
  }

  if (results[1].status === "rejected") {
    throw results[1].reason;
  }

  const controlRecord = results[1].value;
  const controlMap = state.controlMap;
  return [controlMap, controlRecord] as const;
}

export async function getPos() {
  await posAgent.getPosMapPayload();
  // the posMap is updated in the above line by merge function in cache
  const posMap = state.posMap;
  const posRecord = await posAgent.getPosRecord();
  return [posMap, posRecord] as const;
}

/**
 * Get ledMap from ledAgent
 */
export async function getLedMap() {
  await ledAgent.getLedMapPayload();
  // the ledMap is updated in the above line by merge function in cache
  const ledMap = state.ledMap;
  const ledEffectIDtable = state.LEDEffectIDtable;
  return [ledMap, ledEffectIDtable] as const;
}

/**
 * Get part's type from its name
 * should return
 */
export function getPartType(partName: string) {
  const partTypeMap = reactiveState.partTypeMap();
  return partTypeMap[partName];
}

// retrieve the name of the first dancer with this LED part
export function getDancerFromLEDpart(partName: LEDPartName) {
  const dancersArray = state.dancersArray;
  for (const dancer of dancersArray) {
    if (dancer.parts.some((part) => part.name === partName)) {
      return dancer.name;
    }
  }

  throw new Error(`No dancer has LED part ${partName}`);
}

export * from "./Notification";
export * from "./math";
export * from "./localStorage";
export * from "./color";
export * from "./fade";
export * from "./frame";
export * from "./led";
export * from "./genJson";
export * from "./timeFormat";
export * from "./log";
