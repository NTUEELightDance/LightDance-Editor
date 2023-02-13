import { controlAgent, posAgent, ledAgent } from "@/api";
import { reactiveState, state } from "@/core/state";

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
  await controlAgent.getControlMapPayload();
  // the controlMap is updated in the above line by merge function in cache
  const controlMap = state.controlMap;
  const controlRecord = await controlAgent.getControlRecord();
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
  return await ledAgent.getLedMap();
}

/**
 * Get part's type from its name
 * should return
 */
export function getPartType(partName: string) {
  const partTypeMap = reactiveState.partTypeMap();
  return partTypeMap[partName];
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
